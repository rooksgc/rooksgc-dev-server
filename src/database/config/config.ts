require('dotenv').config()

const {
  DB_HOST,
  DB_NAME,
  TEST_DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DIALECT,
  DATABASE_URL,
  DEV_DATABASE_URL,
  TEST_DATABASE_URL
} = process.env

const common = {
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: DB_HOST,
  dialect: DB_DIALECT
}

module.exports = {
  development: {
    ...common,
    url: DEV_DATABASE_URL
  },
  production: {
    ...common,
    url: DATABASE_URL
  },
  test: {
    ...common,
    database: TEST_DB_NAME,
    url: TEST_DATABASE_URL
  }
}
