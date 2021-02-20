import { Router } from 'express'
import UserService, { UserServiceApi } from '../services/user'

const { findAll, create, update }: UserServiceApi = UserService()

export default (router: Router): void => {
  router.get('/users', findAll)
  router.post('/user/create', create)
  router.put('/user/:userId', update)
}
