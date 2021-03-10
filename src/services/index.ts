import SecretService from './secret'
import AuthService from './auth'
import EmailService from './email'
import ValidationService from './validation'

const validationService = ValidationService()
const secretService = SecretService()
const emailService = EmailService()
const authService = AuthService({
  secretService,
  emailService,
  validationService
})

export { authService, secretService, emailService }
