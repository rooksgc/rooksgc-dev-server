import express from 'express'
import config from 'config'
import cors from 'cors'
import routes from './routes'

const port = config.get('port')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

routes(app)

async function start() {
  try {
    app.listen(port, () => console.log(`Server listening on port ${port}...`))
  } catch (error) {
    console.log('Server error: ', error.message)
    process.exit(1)
  }
}

start()
