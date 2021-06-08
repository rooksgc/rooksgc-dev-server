import { Router } from 'express'
import { body } from 'express-validator'
import { userService } from 'services/user'
import { authMiddleware } from 'middleware/auth'

const { changePhoto, populateUsers } = userService

const userRoutes = (router: Router): void => {
  router
    .patch(
      '/user/photo',
      authMiddleware,
      body('id').exists(),
      body('photo').trim().isString(),
      changePhoto
    )
    .post(
      '/users/populate',
      authMiddleware,
      body('ids').exists().isString().trim(),
      populateUsers
    )
}

export { userRoutes }
