import express, { Router, Request, Response } from 'express'
import compression from 'compression'
import config from 'config'
import cors from 'cors'
import { createServer } from 'http'
import { authRoutes } from 'routes/auth'
import { userRoutes } from 'routes/user'
import { chatRoutes } from 'routes/chat'
import { errorMiddleware } from 'middleware/errors'
import { webSocketService } from 'services/socket'

const port = config.get('port')
const host = config.get('host')
const API_PATH = `${config.get('api.prefix')}/${config.get('api.version')}`

const app = express()
const router = Router()
const server = createServer(app)

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
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(API_PATH, router)

// Routes
authRoutes(router)
userRoutes(router)
chatRoutes(router)

// Sockets
webSocketService(server)

app.use(errorMiddleware)

try {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('Routes:')
    router.stack.forEach((layer) => {
      const { path } = layer.route
      const { method } = layer.route.stack[0]
      // eslint-disable-next-line no-console
      console.log(` - ${method.toUpperCase()} => ${API_PATH}${path}`)
    })
  }

  server.listen(port, () => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${port}...`)
    }
  })
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Server error: ', error.message)
  process.exit(1)
}

export { app, API_PATH }
