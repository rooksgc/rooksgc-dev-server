import { Application } from 'express'
import { getAll, create, update } from '../controllers/user'

export default (app: Application): void => {
  app.get('/api/v1/users', getAll)
  app.post('/api/v1/user/create', create)
  app.put('/api/v1/user/:userId', update)
}
