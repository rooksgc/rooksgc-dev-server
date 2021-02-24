import { Router } from 'express'
import { body } from 'express-validator'
import { userService } from '../services'

const { findAll, create, activate } = userService

export default (router: Router): void => {
  router.post(
    '/user/create',
    body('name').trim(),
    body('email').trim().isEmail(),
    body('password')
      .trim()
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/, 'i')
      .withMessage(
        'Пароль должен содержать не менее 6 символов латинского алфавита, включая 1 строчную и 1 прописную букву и хотя бы 1 цифру'
      ),
    create
  ),
    router.patch('/user/activate/:code', activate),
    router.get('/users', findAll)
  // router.put('/user/:userId', update), router.get('/users', findAll)
}
