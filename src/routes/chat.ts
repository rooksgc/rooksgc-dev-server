import { Router } from 'express'
import { body } from 'express-validator'
import { chatService } from 'services/chat'
import { authMiddleware } from 'middleware/auth'

const {
  createChannel,
  populateChannels,
  addContact,
  removeContact,
  populateContacts,
  inviteToContacts,
  removeInvite
} = chatService

const chatRoutes = (router: Router): void => {
  router
    .put(
      '/chat/channel',
      authMiddleware,
      body('name').exists().trim(),
      body('description').trim(),
      body('ownerId').exists().isNumeric(),
      createChannel
    )
    .post(
      '/chat/channels/populate',
      authMiddleware,
      body('channels').exists().isString().trim(),
      populateChannels
    )
    .patch(
      '/chat/contacts',
      authMiddleware,
      body('inviterId').exists().isNumeric(),
      body('userId').exists().isNumeric(),
      addContact
    )
    .delete('/chat/:userId/contact/:contactId', authMiddleware, removeContact)
    .post(
      '/chat/contacts/populate',
      authMiddleware,
      body('userId').exists(),
      body('contacts').exists(),
      populateContacts
    )
    .put(
      '/chat/contact/invite',
      authMiddleware,
      body('inviterId').exists(),
      body('inviterName').exists().isString(),
      body('inviterEmail').exists().isEmail(),
      body('inviterContacts').exists(),
      body('email').trim().isEmail(),
      inviteToContacts
    )
    .delete(
      '/chat/inviter/:inviterId/contact/:userId',
      authMiddleware,
      removeInvite
    )
}

export { chatRoutes }
