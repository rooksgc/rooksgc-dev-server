import { Router } from 'express'
import { getAll, create, update } from '../services/user'

export default (router: Router): void => {
  router.get('/users', getAll)
  router.post('/user/create', create)
  router.put('/user/:userId', update)
}
