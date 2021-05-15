import { Router } from 'express'
import { body } from 'express-validator'
import { chatService } from 'services/chat'
import { authMiddleware } from 'middleware/auth'

const { createChannel, populateChannels } = chatService

const chatRoutes = (router: Router): void => {
  router
    .post(
      '/chat/channels',
      authMiddleware,
      body('channels').exists().isString().trim(),
      populateChannels
    )
    .put(
      '/chat/channel',
      authMiddleware,
      body('name').exists().trim(),
      body('description').trim(),
      body('ownerId').exists().isNumeric(),
      createChannel
    )
}

export { chatRoutes }
