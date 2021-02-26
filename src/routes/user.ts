import { Router } from 'express'
import { body } from 'express-validator'
import { authService } from '../services'
import jwtMiddleware from '../middleware/jwt'

const { findAll, create, activate, login } = authService

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
    router.get('/users', jwtMiddleware, findAll),
    router.post(
      '/user/login',
      body('email').trim().isEmail(),
      body('password').trim(),
      login
    )
  // router.put('/user/:userId', update), router.get('/users', findAll)
}
