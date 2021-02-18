import dotenv from 'dotenv'
dotenv.config()

const { APP_BASE_URL, APP_PORT } = process.env

export default {
  port: APP_PORT,
  baseUrl: APP_BASE_URL
}
