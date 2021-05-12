import config from 'config'
import { createTransport, Transporter, SentMessageInfo } from 'nodemailer'
import { EmailSendingError } from 'services/errors'

export interface EmailServiceApi {
  send: (
    recipients: string[],
    subject: string,
    html: string
  ) => Promise<SentMessageInfo>
  confirmEmail: (
    email: string,
    name: string,
    code: string
  ) => Promise<SentMessageInfo>
  passwordChange: (email: string, code: string) => Promise<SentMessageInfo>
}

const baseUrl = `${config.get('email.protocol')}://${config.get('email.host')}`

const transporter: Transporter = createTransport({
  service: config.get('email.service'),
  auth: {
    user: config.get('email.user'),
    pass: config.get('email.pass')
  }
})

const emailService: EmailServiceApi = {
  async send(
    recipients: string[],
    subject: string,
    html: string
  ): Promise<SentMessageInfo> {
    const email = {
      from: `"${config.get('email.sender.name')}" <${config.get(
        'email.sender.email'
      )}>`,
      to: recipients.join(', '),
      subject,
      html
    }

    try {
      return await transporter.sendMail(email)
    } catch (error) {
      throw new EmailSendingError()
    }
  },

  async confirmEmail(
    email: string,
    name: string,
    code: string
  ): Promise<SentMessageInfo> {
    const codeUrl = `${baseUrl}/auth/activation/${code}`
    return this.send(
      [email],
      'Активация пользователя',
      `Здравствуйте, ${name}. <br>Перейдите по <a href="${codeUrl}">ссылке</a>, чтобы активировать аккаунт в сервисе rooksgc chat.`
    )
  },

  async passwordChange(email: string, code: string): Promise<SentMessageInfo> {
    const codeUrl = `${baseUrl}/auth/change-password/${code}`
    return this.send(
      [email],
      'Восстановление пароля',
      `Здравствуйте, Вы или кто-то другой запросили смену пароля.<br>
  Если это сделали Вы, то перейдите по <a href="${codeUrl}">ссылке</a>, чтобы сменить пароль.<br>
  Если это сделали не Вы, то проигнорируйте это письмо.<br>Внимание! Ссылка является одноразовой, не перезагружайте страницу во время смены пароля.`
    )
  }
}

export { emailService }
