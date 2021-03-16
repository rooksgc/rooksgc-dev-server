import { Router } from 'express'
import { body } from 'express-validator'
import authService from '../services/auth'
import authMiddleware from '../middleware/auth'

const {
  findAll,
  register,
  activate,
  login,
  recover,
  checkSecret,
  changePassword,
  fetchByToken
} = authService

export default (router: Router): void => {
  router
    .put(
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
    )
    .patch('/auth/activate/:code', activate)
    .get('/auth/users', authMiddleware, findAll)
    .post(
      '/auth/login',
      body('email').trim().isEmail(),
      body('password').trim(),
      login
    )
    .post('/auth/recover', body('email').trim().isEmail(), recover)
    .post(
      '/auth/check-secret',
      body('code').trim().isString(),
      body('secretType').isString().isUppercase(),
      checkSecret
    )
    .patch(
      '/auth/change-password',
      body('code').trim().isString(),
      body('password').trim(),
      changePassword
    )
    .post('/auth/fetch-by-token', body('token').trim().isString(), fetchByToken)
}
