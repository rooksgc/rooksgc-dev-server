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
  private re
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
