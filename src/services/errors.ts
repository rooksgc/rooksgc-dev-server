export class ValidationError extends Error {
  private readonly statusCode = 400
}

export class EmailAllreadyExists extends Error {
  private readonly statusCode = 409
  readonly message = 'Email уже существует! Выберите другой адрес.'
}

export class ContactAllreadyExist extends Error {
  private readonly statusCode = 409
  readonly message = 'Пользователь уже находится в Вашем списке контактов'
}

export class ContactNotFound extends Error {
  private readonly statusCode = 404
  readonly message = 'Пользователя нет в Вашем списке контактов'
}

export class CantAddSelfToContacts extends Error {
  private readonly statusCode = 409
  readonly message = 'Нельзя добавлять в контакты себя'
}

export class UserNameAllreadyExists extends Error {
  private readonly statusCode = 409
  readonly message = 'Имя занято! Придумайте другое имя пользователя.'
}

export class InvalidPassword extends Error {
  private readonly statusCode = 401
  readonly message = 'Неверный пароль'
}

export class UnauthorizedError extends Error {
  private readonly statusCode = 401
  readonly message = 'Ошибка авторизации'
}

export class EmailDoesNotExist extends Error {
  private readonly statusCode = 409
  readonly message = 'Пользователя с таким email не существует'
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
  readonly message = 'Ошибка отправки письма'
}

export class SecretNotFound extends Error {
  private readonly statusCode = 404
  readonly message =
    'Ошибка смены пароля: неверный или уже использованный секретный код'
}

export class UserNotFound extends Error {
  private readonly statusCode = 404
  readonly message = 'Пользователь не найден'
}

export class TokenExpiredError extends Error {
  private readonly statusCode = 401
  readonly message = 'TokenExpiredError'
}

export class JsonWebTokenError extends Error {
  private readonly statusCode = 401
  readonly message = 'JsonWebTokenError'
}

export class UserFetchByTokenError extends Error {
  private readonly statusCode = 401
  readonly message = 'Не удалось получить пользователя по токену'
}

export class InviteAllreadyExists extends Error {
  private readonly statusCode = 409
  readonly message =
    'Приглашение уже отправлено пользователю и ждет подтверждения'
}

export class InviteWasCancelled extends Error {
  private readonly statusCode = 409
  readonly message = 'Пользователь отменил свое приглашение'
}

export class InviteDoesNotExists extends Error {
  private readonly statusCode = 409
  readonly message = 'Запроса на добавление не поступало'
}

export class ChannelAllreadyExistForUser extends Error {
  private readonly statusCode = 409
  readonly message = 'Пользователь уже добавлен в канал'
}

export class ChannelNotFound extends Error {
  private readonly statusCode = 404
  readonly message = 'Канал не найден'
}

export class UserAllreadyInChannel extends Error {
  private readonly statusCode = 409
  readonly message = 'Пользователь уже находится в канале'
}

export class OwnerCanNotLeaveChannel extends Error {
  private readonly statusCode = 409
  readonly message = 'Владелец канала не может его покинуть'
}
