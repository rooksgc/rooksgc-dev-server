import { Request, Response } from 'express'
const User = require('../database/models').User

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = await User.findAll()
    res.status(201).send(allUsers)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
}

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    // todo добавлять все поля!
    const { email } = req.body
    const userCollection = await User.create({
      email
    })
    res.status(201).send(userCollection)
  } catch (e) {
    console.log(e)
    res.status(400).send(e)
  }
}

export const update = async (req: Request, res: Response): Promise<void> => {
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
    } else {
      res.status(404).send('Пользователь не найден!')
    }
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
}
