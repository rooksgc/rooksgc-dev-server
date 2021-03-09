import { logger } from '../services'

const ERROR_DEFAULT_MESSAGE = 'Internal Server Error'
const ERROR_DEFAULT_TYPE = 'error'
const ERROR_DEFAULT_STATUS_CODE = 500

export class ValidationError extends Error {
  private readonly statusCode = 400
}

export class EmailAllreadyExists extends Error {
  private readonly statusCode = 409
  readonly message = 'Email уже существует! Выберите другой адрес.'
}

export class InvalidPassword extends Error {
  private readonly statusCode = 401
  readonly message = 'Неверный пароль!'
}

export class UnauthorizedError extends Error {
  private readonly statusCode = 401
  readonly message = 'Ошибка авторизации.'
}

export class EmailDoesNotExist extends Error {
  private readonly statusCode = 409
  readonly message = 'Пользователя с таким email не существует!'
}

export class UserIsNotActivated extends Error {
  private readonly statusCode = 401
  readonly message =
    'Учетная запись не активирована! Воспользуйтесь ссылкой для активации, ранее высланной на Ваш адрес электронной почты.'
}

export class UserActivationError extends Error {
  private readonly statusCode = 401
  readonly message =
    'Ошибка активации пользователя. Попробуйте повторить операцию восстановления пароля.'
}

export class EmailSendingError extends Error {
  private readonly statusCode = 500
  readonly message = 'Ошибка отправки письма!'
}

export class SecretNotFound extends Error {
  private readonly statusCode = 404
  readonly message =
    'Ошибка смены пароля: неверный или уже использованный секретный код!'
}

export class UserNotFound extends Error {
  private readonly statusCode = 404
  readonly message = 'Пользователь не найден'
}

export class UserFetchByTokenError extends Error {
  private readonly statusCode = 401
  readonly message = 'Не удалось получить пользователя по токену'
}

const errorMiddleware = (err, req, res, next) => {
  const type = err.type || ERROR_DEFAULT_TYPE
  const message = err.message || ERROR_DEFAULT_MESSAGE
  const statusCode = err.statusCode || ERROR_DEFAULT_STATUS_CODE
  const ip = req.ip.split(':').pop()

  logger.error(`[${ip}] ${statusCode} ${message}`)

  return res.status(statusCode).json({ type, message })
}

export default errorMiddleware
