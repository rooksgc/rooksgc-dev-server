import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'
import { secretService, SecretTypes } from 'services/secret'
import { validationService } from 'services/validation'
import { emailService } from 'services/email'
import { userService, UserRole } from 'services/user'

import {
  ValidationError,
  EmailAllreadyExists,
  UserNameAllreadyExists,
  InvalidPassword,
  UserActivationError,
  EmailDoesNotExist,
  UserIsNotActivated,
  SecretNotFound,
  UserNotFound,
  UserFetchByTokenError,
  TokenExpiredError,
  JsonWebTokenError
} from './errors'

const { User } = require('database/models')
const { sequelize } = require('database/models')

interface ServerResponse {
  type: string
  message?: string
  data?: any
  token?: string
}

export interface ExtractedTokenPayload {
  userId: number
  iat: number
  exp: number
}

type IResponse = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<Response<ServerResponse>>

export interface AuthServiceApi {
  hashPassword(password: string): Promise<string>
  validatePassword(password: string, hashed: string): Promise<boolean>
  register: IResponse
  activate: IResponse
  login: IResponse
  recover: IResponse
  checkSecret: IResponse
  changePassword: IResponse
  fetchByToken: IResponse
}

const authService: AuthServiceApi = {
  /**
   * Вычисляет хеш от пароля
   * @param {string} password - пароль
   * @return {Promise<string>} хеш пароля
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  },

  /**
   * Проверяет, что `hashed` является хешем `password`.
   * @param password нехешированный пароль
   * @param hashed хеш пароля из бд
   * @returns Promise<boolean> false, если хеши не совпадают
   */
  async validatePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed)
  },

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { name, email, password } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError(message)
      }

      await sequelize.transaction(async () => {
        const foundedByEmail = await User.findOne({ where: { email } })
        if (foundedByEmail) {
          throw new EmailAllreadyExists()
        }

        const foundedByName = await User.findOne({ where: { name } })
        if (foundedByName) {
          throw new UserNameAllreadyExists()
        }

        const hashedPassword = await authService.hashPassword(password)

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
      })

      return res.status(201).json({
        type: 'success',
        message: `Пользователь создан. Активируйте свой аккаунт, выполнив переход по ссылке из письма, которое выслано на адрес: ${email}`
      })
    } catch (error) {
      next(error)
    }
  },

  async activate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { code } = req.params

      await sequelize.transaction(async () => {
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
      })

      return res.status(200).json({
        type: 'success',
        message:
          'Активация прошла успешно. Вы можете перейти на страницу логина для входа.'
      })
    } catch (error) {
      next(error)
    }
  },

  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
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

      const passwordIsValid = await authService.validatePassword(
        password,
        user.password
      )
      if (!passwordIsValid) {
        throw new InvalidPassword()
      }

      const jwtSecret = config.get('jwt.secret')
      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: config.get('jwt.expiresIn')
      })

      return res.status(201).json({
        type: 'success',
        message: 'Успешный вход в систему!',
        token,
        data: userService.userToDTO(user)
      })
    } catch (error) {
      next(error)
    }
  },

  async recover(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { email } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      const userEmail = await sequelize.transaction(async () => {
        const user = await User.findOne({ where: { email } })
        if (!user) {
          throw new EmailDoesNotExist()
        }

        const { id, email: emailAddress } = user
        const secret = await secretService.create(
          id,
          SecretTypes.RECOVER_PASSWORD
        )

        await emailService.passwordChange(emailAddress, secret.public_code)

        return emailAddress
      })

      return res.status(201).json({
        type: 'success',
        message: `Ссылка для смены пароля отправлена на email ${userEmail}. Проверьте Вашу почту!`
      })
    } catch (error) {
      next(error)
    }
  },

  async checkSecret(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
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
  },

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { code, password } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      await sequelize.transaction(async () => {
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

        const newPassword = await authService.hashPassword(password)
        user.password = newPassword
        await user.save()
      })

      return res.status(201).json({
        type: 'success',
        message: 'Пароль успешно изменен!'
      })
    } catch (error) {
      next(error)
    }
  },

  async fetchByToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { token } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      const secret = config.get('jwt.secret')
      let data: ExtractedTokenPayload | null = null

      jwt.verify(token, secret, (err, payload) => {
        if (err) {
          switch (err.name) {
            case 'TokenExpiredError':
              throw new TokenExpiredError()
            case 'JsonWebTokenError':
              throw new JsonWebTokenError()
            default:
              throw new UserFetchByTokenError()
          }
        } else {
          data = payload
        }
      })

      const { userId } = data
      const user = await User.findByPk(userId)
      if (!user) {
        throw new UserNotFound()
      }

      return res
        .status(201)
        .json({ type: 'success', data: userService.userToDTO(user) })
    } catch (error) {
      next(error)
    }
  }
}

export { authService }
