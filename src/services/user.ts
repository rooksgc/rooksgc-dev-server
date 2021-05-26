import { NextFunction, Request, Response } from 'express'
import { validationService } from 'services/validation'
import { ValidationError, UserNotFound } from 'services/errors'

const { User } = require('database/models')

export const UserModel = User

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
  contactAdded?: boolean
}

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

type IResponse = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<Response<ServerResponse>>

export interface UserServiceApi {
  userToDTO: (user: typeof User) => UserDTO
  findById: (userId: number) => Promise<typeof User>
  findByEmail: (email: string) => Promise<typeof User>
  findAll: (condition: any) => Promise<UserDTO[]>
  populateUsers: IResponse
  changePhoto: IResponse
}

const userService: UserServiceApi = {
  /**
   * Объект пользователя для фронтенда
   * @param {User} user объект пользователя от БД
   * @returns {UserDTO} объект для передачи на фронтенд
   */
  userToDTO(user: typeof User): UserDTO {
    const userDto = user.dataValues ? { ...user.dataValues } : { ...user }
    delete userDto.password
    delete userDto.createdAt
    delete userDto.updatedAt
    delete userDto.is_active

    return userDto
  },

  /** Поиск по id */
  async findById(userId: number): Promise<typeof User> {
    return await User.findByPk(userId)
  },

  /** Поиск по email */
  async findByEmail(email: string): Promise<typeof User> {
    return await User.findOne({ where: { email } })
  },

  /** Поиск всех пользователей с необязательным фильтром */
  async findAll(condition = {}): Promise<UserDTO[]> {
    const allUsers = await User.findAll(condition)
    const allUsersDTO = allUsers.map((user) => userService.userToDTO(user))
    return allUsersDTO
  },

  /** Раскрыть список пользователей по списку id */
  async populateUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { ids } = req.body
      const usersList = JSON.parse(ids)

      const users = await User.findAll({
        where: { id: usersList }
      })
      const usersDTO = users.map((user) => userService.userToDTO(user))
      return res.status(200).json({ type: 'success', data: usersDTO })
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
  }
}

export { userService }
