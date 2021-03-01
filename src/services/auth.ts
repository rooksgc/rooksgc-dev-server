import { NextFunction, Request, Response } from 'express'
const User = require('../database/models').User
import bcrypt from 'bcryptjs'
import { EmailServiceApi } from '../services/email'
import { SecretServiceApi, SecretTypes } from '../services/secret'
import { ServerResponse } from '../types/server'
import { ValidationServiceApi } from '../services/validation'
import jwt from 'jsonwebtoken'
import config from 'config'
import {
  ValidationError,
  EmailAllreadyExists,
  InvalidPassword,
  UserActivationError,
  EmailDoesNotExist,
  UserIsNotActivated,
  SecretNotFound,
  UserNotFound
} from '../middleware/errors'

export interface UserDTO {
  id: number
  name: string
  email: string
  role: string
}

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

type AuthMethodType = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<Response<ServerResponse>>

export interface AuthServiceApi {
  register: AuthMethodType
  findAll: AuthMethodType
  activate: AuthMethodType
  login: AuthMethodType
  recover: AuthMethodType
  checkSecret: AuthMethodType
  changePassword: AuthMethodType
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
  const register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> => {
    try {
      const { name, email, password } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError(message)
      }

      const foundedUser = await User.findOne({ where: { email } })
      if (foundedUser) {
        throw new EmailAllreadyExists()
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

      return res.status(201).json({
        type: 'success',
        message: `Пользователь создан. Активируйте свой аккаунт, выполнив переход по ссылке из письма, которое выслано на адрес: ${email}`
      })
    } catch (error) {
      next(error)
    }
  }

  const findAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> => {
    try {
      const allUsers = await User.findAll()
      return res.status(201).json({ type: 'success', data: allUsers })
    } catch (error) {
      next(error)
    }
  }

  const activate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> => {
    try {
      const { code } = req.params
      const secret = await secretService.findByPublicCode(
        code,
        SecretTypes.EMAIL_CONFIRMATION
      )

      if (!secret) {
        throw new UserActivationError()
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
      next(error)
    }
  }

  const login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> => {
    try {
      const { email, password } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      const user = await User.findOne({ where: { email } })

      if (!user) {
        throw new EmailDoesNotExist()
      } else if (!user.is_active) {
        throw new UserIsNotActivated()
      }

      const passwordIsValid = await validatePassword(password, user.password)

      if (!passwordIsValid) {
        throw new InvalidPassword()
      }

      const jwtSecret = config.get('jwt.secret')
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: 120 })

      return res.status(201).json({
        type: 'success',
        message: 'Успешный вход в систему!',
        token,
        data: userToDTO(user.dataValues)
      })
    } catch (error) {
      next(error)
    }
  }

  const recover = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> => {
    try {
      const { email } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      const user = await User.findOne({ where: { email } })

      if (!user) {
        throw new EmailDoesNotExist()
      }

      const { id, email: userEmail } = user

      const secret = await secretService.create(
        id,
        SecretTypes.RECOVER_PASSWORD
      )

      await emailService.passwordChange(userEmail, secret.public_code)

      return res.status(201).json({
        type: 'success',
        message: `Ссылка для смены пароля отправлена на email ${userEmail}. Проверьте Вашу почту!`
      })
    } catch (error) {
      next(error)
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

  const userToDTO = (user: typeof User): UserDTO => {
    const userDto = { ...user }
    delete userDto.password
    delete userDto.createdAt
    delete userDto.updatedAt
    delete userDto.is_active
    return userDto
  }

  const checkSecret = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> => {
    try {
      const { code, secretType } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      const secret = await secretService.findByPublicCode(code, secretType)

      if (!secret) {
        throw new SecretNotFound()
      }

      return res.status(201).json({
        type: 'success'
      })
    } catch (error) {
      next(error)
    }
  }

  // changePassword
  const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> => {
    try {
      const { code, password } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      const secret = await secretService.findByPublicCode(
        code,
        SecretTypes.RECOVER_PASSWORD
      )

      if (!secret) {
        throw new SecretNotFound()
      }

      await secretService.deleteById(secret.id)

      const { user_id } = secret

      const user = await User.findByPk(user_id)

      if (!user) {
        throw new UserNotFound()
      }

      const newPassword = await hashPassword(password)
      user.password = newPassword
      await user.save()

      return res.status(201).json({
        type: 'success',
        message: 'Пароль успешно изменен!'
      })
    } catch (error) {
      next(error)
    }
  }

  return {
    register,
    findAll,
    activate,
    login,
    recover,
    checkSecret,
    changePassword
  }
}

export default AuthService
