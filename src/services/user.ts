import { NextFunction, Request, Response } from 'express'
import { validationService } from 'services/validation'

import {
  ValidationError,
  EmailDoesNotExist,
  UserNotFound,
  ContactAllreadyExist,
  CantAddSelfToContacts
} from './errors'

const { User } = require('database/models')

export interface ServerResponse {
  type: string
  message?: string
  data?: any
  token?: string
}

export interface UserDTO {
  id: number
  name: string
  email: string
  photo: string
  role: string
  channels: string
  contacts: string
}

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

type UserMethodType = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<Response<ServerResponse>>

export interface UserServiceApi {
  userToDTO(user: typeof User): UserDTO
  findById(userId: number): Promise<typeof User>
  findAll: UserMethodType
  changePhoto: UserMethodType
  addContact: UserMethodType
}

const userService: UserServiceApi = {
  /**
   * Объект пользователя для фронтенда
   * @param {User} user объект пользователя от БД
   * @returns {UserDTO} объект для передачи на фронтенд
   */
  userToDTO(user: typeof User): UserDTO {
    const userDto = { ...user }
    delete userDto.password
    delete userDto.createdAt
    delete userDto.updatedAt
    delete userDto.is_active
    return userDto
  },

  /** Поиск пользователя по id */
  async findById(userId: number) {
    return await User.findByPk(userId)
  },

  /** Поиск всех пользователей */
  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const allUsers = await User.findAll()
      const allUsersDTO = allUsers.map((user) =>
        userService.userToDTO(user.dataValues)
      )
      return res.status(201).json({ type: 'success', data: allUsersDTO })
    } catch (error) {
      next(error)
    }
  },

  /** Изменение фото пользователя */
  async changePhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { id, photo } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      const user = await User.findByPk(id)
      if (!user) {
        throw new UserNotFound()
      }

      user.photo = photo
      await user.save()

      return res
        .status(201)
        .json({ type: 'success', message: 'Фото пользователя изменено' })
    } catch (error) {
      next(error)
    }
  },

  /** Добавление нового контакта для пользователя */
  async addContact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { from, email } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      const userToAdd = await User.findOne({ where: { email } })
      if (!userToAdd) {
        throw new EmailDoesNotExist()
      }

      const userForContactAdd = await User.findByPk(from)

      if (userForContactAdd.email === email) {
        throw new CantAddSelfToContacts()
      }

      const userContacts = userForContactAdd.contacts
        ? JSON.parse(userForContactAdd.contacts)
        : []

      if (userContacts.includes(userToAdd.id)) {
        throw new ContactAllreadyExist()
      }

      userContacts.push(userToAdd.id)
      userForContactAdd.contacts = JSON.stringify(userContacts)

      await userForContactAdd.save()

      const data = JSON.stringify(userService.userToDTO(userToAdd))

      return res.status(201).json({
        type: 'success',
        message: 'Контакт успешно добавлен',
        data
      })
    } catch (error) {
      next(error)
    }
  }
}

export { userService }
