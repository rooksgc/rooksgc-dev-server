import SecretService from './secret'
import UserService from './user'
import EmailService from './email'
import ValidationService from './validation'

const validationService = ValidationService()
const secretService = SecretService()
const emailService = EmailService()
const userService = UserService({
  secretService,
  emailService,
  validationService
})

export { userService, secretService, emailService }
