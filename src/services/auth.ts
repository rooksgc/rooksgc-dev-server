import { Request, Response } from 'express'
const User = require('../database/models').User
import bcrypt from 'bcryptjs'
import { EmailServiceApi } from '../services/email'
import { SecretServiceApi, SecretTypes } from '../services/secret'
import { ServerResponse } from '../types/server'
import { ValidationServiceApi } from '../services/validation'
import jwt from 'jsonwebtoken'
import config from 'config'

export interface UserDTO {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
}

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

type AuthMethodType = (
  req: Request,
  res: Response
) => Promise<Response<ServerResponse>>

export interface AuthServiceApi {
  create: AuthMethodType
  findById: (userId: number) => Promise<UserDTO> | null
  findAll: AuthMethodType
  activate: AuthMethodType
  login: AuthMethodType
}

export interface AuthServiceDeps {
  secretService: SecretServiceApi
  emailService: EmailServiceApi
  validationService: ValidationServiceApi
}

const AuthService = ({
  secretService,
  emailService,
  validationService
}: AuthServiceDeps): AuthServiceApi => {
  const findById = async (userId: number): Promise<UserDTO> | null => {
    try {
      return await User.findByPk(userId)
    } catch (error) {
      return null
    }
  }

  const create = async (
    req: Request,
    res: Response
  ): Promise<Response<ServerResponse>> => {
    try {
      const { name, email, password } = req.body
      const message = validationService.validate(req)
      if (message) {
        return res.status(400).json({ type: 'error', message })
      }

      const foundedUser = await User.findOne({ where: { email } })
      if (foundedUser) {
        return res.status(409).json({
          type: 'error',
          message: `Email ${foundedUser.email} уже существует!`
        })
      }

      const hashedPassword = await hashPassword(password)

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: UserRole.USER,
        is_active: false
      })

      const secret = await secretService.create(
        newUser.id,
        SecretTypes.EMAIL_CONFIRMATION
      )

      await emailService.confirmEmail(email, name, secret.public_code)

      const userDTO = newUser.dataValues
      delete userDTO.password

      return res.status(201).json({
        type: 'success',
        message: `Пользователь создан. Активируйте свой аккаунт, выполнив переход по ссылке из письма, которое выслано на адрес: ${email}`,
        data: userDTO
      })
    } catch (error) {
      return res.status(400).json({ type: 'error', message: error.message })
    }
  }

  const findAll = async (
    req: Request,
    res: Response
  ): Promise<Response<ServerResponse>> => {
    try {
      const allUsers = await User.findAll()
      return res.status(201).json({ type: 'success', data: allUsers })
    } catch (error) {
      return res.status(500).json({ type: 'error', message: error.message })
    }
  }

  const activate = async (
    req: Request,
    res: Response
  ): Promise<Response<ServerResponse>> => {
    try {
      const { code } = req.params
      const secret = await secretService.findByPublicCode(
        code,
        SecretTypes.EMAIL_CONFIRMATION
      )

      if (!secret) {
        return res.status(404).json({
          type: 'error',
          message:
            'Ошибка активации пользователя. Попробуйте повторить операцию восстановления пароля.'
        })
      }

      const user = await User.findByPk(secret.user_id)
      user.is_active = true
      await user.save()

      await secretService.deleteById(secret.id)

      return res.status(201).json({
        type: 'success',
        message:
          'Активация прошла успешно. Вы можете перейти на страницу логина для входа.'
      })
    } catch (error) {
      return res.status(500).json({
        type: 'error',
        message: error.message
      })
    }
  }

  const login = async (
    req: Request,
    res: Response
  ): Promise<Response<ServerResponse>> => {
    try {
      const { email, password } = req.body
      const message = validationService.validate(req)
      if (message) {
        return res.status(400).json({ type: 'error', message })
      }

      const user = await User.findOne({ where: { email } })

      if (!user) {
        return res.status(409).json({
          type: 'error',
          message: 'Пользователя с таким email не существует!'
        })
      } else if (!user.is_active) {
        return res.status(401).json({
          type: 'error',
          message:
            'Учетная запись не активирована! Воспользуйтесь ссылкой для активации, ранее высланной на Ваш адрес электронной почты.'
        })
      }

      const passwordIsValid = await validatePassword(password, user.password)

      if (!passwordIsValid) {
        return res.status(401).json({
          type: 'error',
          message: 'Неверный пароль!'
        })
      }

      const jwtSecret = config.get('jwt.secret')
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: 120 })

      return res.status(201).json({
        type: 'success',
        message: 'Успешный вход в систему!',
        token
      })
    } catch (error) {
      return res.status(400).json({ type: 'error', message: error.message })
    }
  }

  /**
   * Вычисляет хеш от пароля
   * @param {string} password - пароль
   * @return {Promise<string>} хеш пароля
   */
  const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }

  /**
   * Проверяет, что `hashed` является хешем `password`.
   * @param password нехешированный пароль
   * @param hashed хеш пароля из бд
   * @returns Promise<boolean> false, если хеши не совпадают
   */
  const validatePassword = async (
    password: string,
    hashed: string
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hashed)
  }

  return {
    create,
    findById,
    findAll,
    activate,
    login
  }
}

export default AuthService
