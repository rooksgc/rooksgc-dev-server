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
  TEST_EMAIL_PROTOCOL,
  TEST_EMAIL_HOST,
  EMAIL_SENDER_NAME,
  EMAIL_SENDER_EMAIL,
  TEST_JWT_SECRET,
  JWT_ALGORITHMS,
  JWT_EXPIRES_IN
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
    protocol: TEST_EMAIL_PROTOCOL,
    host: TEST_EMAIL_HOST,
    sender: {
      name: EMAIL_SENDER_NAME,
      email: EMAIL_SENDER_EMAIL
    }
  },
  jwt: {
    secret: TEST_JWT_SECRET,
    algorithms: JWT_ALGORITHMS,
    expiresIn: JWT_EXPIRES_IN
  }
}
