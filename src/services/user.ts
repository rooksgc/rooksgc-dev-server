import { Request, Response } from 'express'
const User = require('../database/models').User
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'

export interface UserDTO {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
}

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

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
      // 3 Запись в Secrets записи с новым сгенерированным секретом (public_code)
      //   и secret_type = SecretTypes.EMAIL_CONFIRMATION для used_id = id юзера
      // 4 Отсылка письма на email юзера со ссылкой для активации

      let { name, email, password } = req.body

      const errors = validationResult(req)

      name = name.trim()
      email = email.trim()
      password = password.trim()

      if (!errors.isEmpty()) {
        console.log('Validation errors: ', errors)
        res.status(400).json({ errors: errors.array() })
      }

      const foundedUser = await findByEmail(email)
      if (foundedUser) {
        res.status(409).json({
          error: `Email ${foundedUser.email} уже существует!`
        })
        return
      }

      const hashedPassword = await hashPassword(password)

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        is_active: false
      })

      // 1
      // const secret = await tx.secretService.create(user.id, SecretTypes.emailConformation);

      // 2 отправка e-mail в том числе и как средство проверки валидности email
      // await this.emailService.confirmEmail(email, name, secret.publicCode);

      const userDTO = newUser.dataValues
      delete userDTO.password

      res.status(201).json(userDTO)
    } catch (error) {
      res.status(400).json(error)
    }
  }

  const findAll = async (
    req: Request,
    res: Response
  ): Promise<UserResponseDTO[]> => {
    try {
      const allUsers = await User.findAll()
      res.status(201).json(allUsers)

      return allUsers
    } catch (e) {
      console.log(e)
      res.status(500).json(e)
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
        res.status(201).json(updatedUser)

        return updatedUser
      } else {
        res.status(404).json('Пользователь не найден!')
      }
    } catch (e) {
      console.log(e)
      res.status(500).json(e)
    }
  }

  const findByEmail = async (email: string): Promise<UserResponseDTO> => {
    try {
      return await User.findOne({ where: { email } })
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Вычисляет хеш от пароля.
   * @param password пароль
   * @return хеш пароля
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
  ): Promise<string | { error: string }> => {
    const result = await bcrypt.compare(password, hashed)
    if (!result) {
      return {
        error: 'Неверный пароль!'
      }
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
