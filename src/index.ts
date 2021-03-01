import express, { Router, Request, Response } from 'express'
import compression from 'compression'
import config from 'config'
import cors from 'cors'
import authRoutes from './routes/auth'
import errorsMiddleware from './middleware/errors'

const port = config.get('port')
const host = config.get('host')
const API_PATH = `${config.get('api.prefix')}/${config.get('api.version')}`

const app = express()
const router = Router()

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

app.use(cors({ origin: `${host}:${port}` }))
app.use(express.urlencoded())
app.use(express.json())
app.use(API_PATH, router)

// Routes
authRoutes(router)

app.use(errorsMiddleware)

async function start() {
  try {
    console.log('Routes:')
    router.stack.forEach((layer) => {
      const { path } = layer.route
      const { method } = layer.route.stack[0]
      console.log(` - ${method.toUpperCase()} => ${API_PATH}${path}`)
    })

    app.listen(port, () => console.log(`Server listening on port ${port}...`))
  } catch (error) {
    console.log('Server error: ', error.message)
    process.exit(1)
  }
}

start()
