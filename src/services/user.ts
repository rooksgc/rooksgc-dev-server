import { Request, Response } from 'express'
const User = require('../database/models').User
import bcrypt from 'bcryptjs'
import { EmailServiceApi } from '../services/email'
import { SecretServiceApi, SecretTypes } from '../services/secret'
import { ServerResponse } from '../types/server'
import { ValidationServiceApi } from '../services/validation'

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

export interface UserServiceApi {
  create: (req: Request, res: Response) => Promise<Response<ServerResponse>>
  findAll: (req: Request, res: Response) => Promise<Response<ServerResponse>>
  activate: (req: Request, res: Response) => Promise<Response<ServerResponse>>
  findByEmail: (email: string) => Promise<UserDTO>
}

export interface UserServiceDeps {
  secretService: SecretServiceApi
  emailService: EmailServiceApi
  validationService: ValidationServiceApi
}

const UserService = ({
  secretService,
  emailService,
  validationService
}: UserServiceDeps): UserServiceApi => {
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

      const foundedUser = await findByEmail(email)
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

      if (secret) {
        const user = await User.findByPk(secret.user_id)
        user.is_active = true
        await user.save()

        await secretService.deleteById(secret.id)

        return res.status(201).json({
          type: 'success',
          message:
            'Активация прошла успешно. Вы можете перейти на страницу логина для входа.'
        })
      } else {
        return res.status(404).json({
          type: 'error',
          message:
            'Ошибка активации пользователя. Попробуйте повторить операцию восстановления пароля.'
        })
      }
    } catch (error) {
      return res.status(500).json({
        type: 'error',
        message: error.message
      })
    }
  }

  // const update = async (
  //   req: Request,
  //   res: Response
  // ): Promise<UserResponseDTO> => {
  //   try {
  //     const { id, email } = req.body
  //     const foundedUser = await User.find({
  //       id
  //     })
  //     if (foundedUser) {
  //       const updatedUser = await User.update({
  //         email
  //       })
  //       res.status(201).json(updatedUser)

  //       return updatedUser
  //     } else {
  //       res.status(404).json('Пользователь не найден!')
  //     }
  //   } catch (e) {
  //     console.log(e)
  //     res.status(500).json(e)
  //   }
  // }

  /**
   * Найти пользователя по email
   * @param {string} email пароль
   * @throws Error - если email не найден
   * @return Promise<UserResponseDTO> Объект данных пользователя
   */
  const findByEmail = async (email: string): Promise<UserDTO> => {
    try {
      return await User.findOne({ where: { email } })
    } catch (error) {
      throw new Error('Email пользователя не найден!')
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
   * @param password пароль
   * @param hashed хеш пароля
   * @throws WrongPassword если пароли не совпадают
   */
  const validatePassword = async (
    password: string,
    hashed: string
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hashed)
  }

  return {
    findByEmail,
    create,
    findAll,
    activate
  }
}

export default UserService
