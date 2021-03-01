import { Router } from 'express'
import { body } from 'express-validator'
import { authService } from '../services'
import jwtMiddleware from '../middleware/jwt'

const {
  findAll,
  register,
  activate,
  login,
  recover,
  checkSecret,
  changePassword
} = authService

export default (router: Router): void => {
  router.post(
    '/auth/register',
    body('name').trim(),
    body('email').trim().isEmail(),
    body('password')
      .trim()
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/, 'i')
      .withMessage(
        'Пароль должен содержать не менее 6 символов латинского алфавита, включая 1 строчную и 1 прописную букву и хотя бы 1 цифру'
      ),
    register
  ),
    router.patch('/auth/activate/:code', activate),
    router.get('/auth/users', jwtMiddleware, findAll),
    router.post(
      '/auth/login',
      body('email').trim().isEmail(),
      body('password').trim(),
      login
    ),
    router.post('/auth/recover', body('email').trim().isEmail(), recover),
    router.post(
      '/auth/check-secret',
      body('code').trim().isString(),
      body('secretType').isString().isUppercase(),
      checkSecret
    ),
    router.patch(
      '/auth/change-password',
      body('code').trim().isString(),
      body('password').trim(),
      changePassword
    )
  // router.put('/auth/user/:userId', update), router.get('/auth/users', findAll)
}

// change-password
