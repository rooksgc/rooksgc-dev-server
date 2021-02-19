import dotenv from 'dotenv'
dotenv.config()

const { APP_HOST, APP_PORT, API_PREFIX, API_VERSION } = process.env

export default {
  port: APP_PORT,
  host: APP_HOST,
  api: {
    prefix: API_PREFIX,
    version: API_VERSION
  }
}
