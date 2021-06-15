import { Router } from 'express'
import { body } from 'express-validator'
import { authService } from 'services/auth'
import { WRONG_PASSWORD_MESSAGE } from 'services/validation'

const {
  register,
  activate,
  login,
  recover,
  checkSecret,
  changePassword,
  fetchByToken
} = authService

const authRoutes = (router: Router): void => {
  router
    .put(
      '/auth/register',
      body('name').trim(),
      body('email').trim().isEmail(),
      body('password')
        .trim()
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/, 'i')
        .withMessage(WRONG_PASSWORD_MESSAGE),
      register
    )
    .patch('/auth/activate/:code', activate)
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

export { authRoutes }
