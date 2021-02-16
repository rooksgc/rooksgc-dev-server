import express from 'express'
import config from 'config'
import { Sequelize } from 'sequelize'
import helloRoutes from './routes/hello'

// app
const app = express()

// config
const port = config.get('port')
const dbuser = config.get('db.user')
const dbpass = config.get('db.pass')
const dbhost = config.get('db.host')
const dbport = config.get('db.port')
const dbname = config.get('db.name')

// sequelize orm
const sequelize = new Sequelize(
  `postgres://${dbuser}:${dbpass}@${dbhost}:${dbport}/${dbname}`
)

// todo type fix
app.use(express.json({ extended: true } as unknown))

// routes
app.use('/api/hello', helloRoutes)

async function start() {
  try {
    await sequelize.authenticate()
    console.log('Postgres successfully connected')

    app.listen(port, () => console.log(`Server listening on port ${port}...`))
  } catch (error) {
    console.log('Server error: ', error.message)
    process.exit(1)
  }
}

start()
