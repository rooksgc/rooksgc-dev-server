import { Request, Response } from 'express'
import userController from '../controllers/user'

export default (app) => {
  app.get('/api/v1', (req: Request, res: Response) => {
    res.status(200).send({
      data: 'Welcome Node Sequlize API v1'
    })
  })
  app.get('/api/v1/users', userController.getAll)
  app.post('/api/v1/user/create', userController.create)
  app.put('/api/v1/user/:userId', userController.update)
}
