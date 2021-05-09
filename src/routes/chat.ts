import { Router } from 'express'
import { body } from 'express-validator'
import chatService from 'services/chat'
import authMiddleware from 'middleware/auth'

const { createChannel, fetchUserChannels } = chatService

export default (router: Router): void => {
  router
    .get('/chat/channels/:userId', authMiddleware, fetchUserChannels)
    .put(
      '/chat/channel',
      authMiddleware,
      body('name').exists().trim(),
      body('description').trim(),
      body('ownerId').exists().isNumeric(),
      createChannel
    )
  // .patch('/auth/activate/:code', activate)
  // .get('/auth/users', authMiddleware, findAll)
  // .post(
  //   '/auth/login',
  //   body('email').trim().isEmail(),
  //   body('password').trim(),
  //   login
  // )
  // .post('/auth/recover', body('email').trim().isEmail(), recover)
  // .post(
  //   '/auth/check-secret',
  //   body('code').trim().isString(),
  //   body('secretType').isString().isUppercase(),
  //   checkSecret
  // )
  // .patch(
  //   '/auth/change-password',
  //   body('code').trim().isString(),
  //   body('password').trim(),
  //   changePassword
  // )
  // .post('/auth/fetch-by-token', body('token').trim().isString(), fetchByToken)
}
