import dotenv from 'dotenv'
dotenv.config()

const {
  APP_HOST,
  APP_PORT,
  API_PREFIX,
  API_VERSION,
  EMAIL_SERVICE,
  EMAIL_USER,
  EMAIL_PASSWORD,
  DEV_EMAIL_PROTOCOL,
  DEV_EMAIL_HOST,
  EMAIL_SENDER_NAME,
  EMAIL_SENDER_EMAIL
} = process.env

export default {
  port: APP_PORT,
  host: APP_HOST,
  api: {
    prefix: API_PREFIX,
    version: API_VERSION
  },
  email: {
    service: EMAIL_SERVICE,
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
    protocol: DEV_EMAIL_PROTOCOL,
    host: DEV_EMAIL_HOST,
    sender: {
      name: EMAIL_SENDER_NAME,
      email: EMAIL_SENDER_EMAIL
    }
  }
}
