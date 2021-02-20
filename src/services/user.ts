import { Request, Response } from 'express'
const User = require('../database/models').User

export interface UserResponseDTO {
  id: number
  name: string
  email: string
  password: string
  role: string
  is_active: boolean
  createdAt: string
  updatedAt: string
}

export interface UserDTO {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
}

export interface UserCreateResponseError {
  error: string
}

export interface UserServiceApi {
  findByEmail: (email: string) => Promise<UserResponseDTO>
  create: (
    req: Request,
    res: Response
  ) => Promise<UserDTO | UserCreateResponseError>
  findAll: (req: Request, res: Response) => Promise<UserResponseDTO[]>
  update: (req: Request, res: Response) => Promise<UserResponseDTO>
}

const UserService = (): UserServiceApi => {
  const create = async (
    req: Request,
    res: Response
  ): Promise<UserDTO | UserCreateResponseError> => {
    try {
      // 1 Валидация полей (нет ли такого же email/name в базе)
      // 2 Создание неактивного юзера (с флагом is_active: false и role: 'user')
      // 3 Запись в Secrets записи с новым сгенерированным секретом (public_code)
      //   и secret_type = SecretTypes.EMAIL_CONFIRMATION для used_id = id юзера
      // 4 Отсылка письма на email юзера со ссылкой для активации

      const { name, email, password } = req.body
      const foundedUser = await findByEmail(email)

      if (foundedUser) {
        res.status(409).send({
          error: `Email ${foundedUser.email} уже существует!`
        })
        return
      }

      // todo hash password
      const newUser = await User.create({
        name,
        email,
        password,
        role: 'user',
        is_active: false
      })

      const userDTO = userToDTO(newUser)
      res.status(201).send(userDTO)
    } catch (error) {
      res.status(400).send(error)
    }
  }

  const findAll = async (
    req: Request,
    res: Response
  ): Promise<UserResponseDTO[]> => {
    try {
      const allUsers = await User.findAll()
      res.status(201).send(allUsers)

      return allUsers
    } catch (e) {
      console.log(e)
      res.status(500).send(e)
    }
  }

  const update = async (
    req: Request,
    res: Response
  ): Promise<UserResponseDTO> => {
    try {
      const { id, email } = req.body
      const foundedUser = await User.find({
        id
      })
      if (foundedUser) {
        const updatedUser = await User.update({
          email
        })
        res.status(201).send(updatedUser)

        return updatedUser
      } else {
        res.status(404).send('Пользователь не найден!')
      }
    } catch (e) {
      console.log(e)
      res.status(500).send(e)
    }
  }

  const userToDTO = (user: UserResponseDTO): UserDTO => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, createdAt, updatedAt, ...userDto } = user
    return userDto
  }

  const findByEmail = async (email: string): Promise<UserResponseDTO> => {
    try {
      return await User.findOne({ where: { email } })
    } catch (error) {
      console.log(error)
    }
  }

  return {
    findByEmail,
    create,
    findAll,
    update
  }
}

export default UserService
