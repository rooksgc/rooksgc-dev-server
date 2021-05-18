import { Router } from 'express'
import { body } from 'express-validator'
import { userService } from 'services/user'
import { authMiddleware } from 'middleware/auth'

const {
  changePhoto,
  addContact,
  removeContact,
  populateContacts,
  findMany
} = userService

const userRoutes = (router: Router): void => {
  router
    .patch(
      '/user/photo',
      authMiddleware,
      body('id').exists(),
      body('photo').trim().isString(),
      changePhoto
    )
    .patch(
      '/user/contacts',
      authMiddleware,
      body('from').exists(),
      body('email').trim().isEmail(),
      addContact
    )
    .delete('/user/:userId/contact/:contactId', authMiddleware, removeContact)
    .post(
      '/user/contacts',
      authMiddleware,
      body('contacts').exists().isString().trim(),
      populateContacts
    )
    .post(
      '/user/list',
      authMiddleware,
      body('members').exists().isString().trim(),
      findMany
    )
}

export { userRoutes }
