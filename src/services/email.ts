import { createTransport, Transporter, SentMessageInfo } from 'nodemailer'
import config from 'config'

export interface EmailServiceApi {
  confirmEmail: (
    email: string,
    name: string,
    code: string
  ) => Promise<SentMessageInfo>
  passwordChange: (email: string, code: string) => Promise<SentMessageInfo>
}

const EmailService = (): EmailServiceApi => {
  const baseUrl = `${config.get('email.protocol')}://${config.get(
    'email.host'
  )}`

  const transporter: Transporter = createTransport({
    service: config.get('email.service'),
    auth: {
      user: config.get('email.user'),
      pass: config.get('email.pass')
    }
  })

  const confirmEmail = async (
    email: string,
    name: string,
    code: string
  ): Promise<SentMessageInfo> => {
    const codeUrl = `${baseUrl}/auth/activation/${code}`
    return await send(
      [email],
      'Активация пользователя',
      `Здравствуйте, ${name}. <br>Перейдите по <a href="${codeUrl}">ссылке</a>, чтобы активировать аккаунт в сервисе rooksgc chat.`
    )
  }

  const passwordChange = async (
    email: string,
    code: string
  ): Promise<SentMessageInfo> => {
    const codeUrl = `${baseUrl}/auth/recover/${code}`
    return await send(
      [email],
      'Восстановление пароля',
      `Здравствуйте, Вы или кто-то другой запросили смену пароля.<br>
Если это сделали вы, то перейдите по <a href="${codeUrl}">ссылке</a>, чтобы восстановить пароль.<br>
Если это сделали не Вы, то проигнорируйте это письмо.`
    )
  }

  const send = async (
    recipients: string[],
    subject: string,
    html: string
  ): Promise<SentMessageInfo> => {
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
    } catch (e) {
      throw new Error('Ошибка отправки письма!')
    }
  }

  return {
    confirmEmail,
    passwordChange
  }
}

export default EmailService
