import express, { Router, Request, Response } from 'express'
import compression from 'compression'
import config from 'config'
import cors from 'cors'
import userRoutes from './routes/user'

const port = config.get('port')
const host = config.get('host')
const app = express()
const router = Router()
const API_PATH = `${config.get('api.prefix')}/${config.get('api.version')}`

app.use(
  compression({
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    }
  })
)
app.use(
  cors({
    origin: host
  })
)
app.use(express.json())
app.use(express.urlencoded())

app.use(API_PATH, router)
userRoutes(router)

async function start() {
  try {
    console.log('Routes:')
    router.stack.forEach((layer) => {
      const { path } = layer.route
      const { method, name } = layer.route.stack[0]
      console.log(` - ${method.toUpperCase()} ${name} => ${API_PATH}${path}`)
    })

    app.listen(port, () => console.log(`Server listening on port ${port}...`))
  } catch (error) {
    console.log('Server error: ', error.message)
    process.exit(1)
  }
}

start()
