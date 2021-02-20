import { Router } from 'express'
import UserService, { UserServiceApi } from '../services/user'
import { body } from 'express-validator'

const { findAll, create, update }: UserServiceApi = UserService()

export default (router: Router): void => {
  router.get('/users', findAll)
  router.post('/user/create', body('email').isEmail(), create)
  router.put('/user/:userId', update)
}
