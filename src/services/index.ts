import SecretService from './secret'
import AuthService from './auth'
import EmailService from './email'
import ValidationService from './validation'
import LoggerService from './logger'

const logger = LoggerService()
const validationService = ValidationService()
const secretService = SecretService()
const emailService = EmailService()
const authService = AuthService({
  secretService,
  emailService,
  validationService
})

export { logger, authService, secretService, emailService }
