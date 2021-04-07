import express, { Router, Request, Response } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import compression from 'compression'
import config from 'config'
import cors from 'cors'
import authRoutes from './routes/auth'
import errorsMiddleware from './middleware/errors'
import logger from './services/logger'
import useSockets from './services/sockets'

const port = config.get('port')
const host = config.get('host')
const API_PATH = `${config.get('api.prefix')}/${config.get('api.version')}`

const app = express()
const router = Router()
const server = createServer(app)
// const ioConfig = {
//   pingInterval: 25000,
//   pingTimeout: 60000
// }
const io = new Server(server)

useSockets(io)

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

app.use(errorsMiddleware)

async function start() {
  try {
    logger.info('Routes:')
    router.stack.forEach((layer) => {
      const { path } = layer.route
      const { method } = layer.route.stack[0]
      logger.info(` - ${method.toUpperCase()} => ${API_PATH}${path}`)
    })

    server.listen(port, () =>
      logger.info(`Server listening on port ${port}...`)
    )
  } catch (error) {
    logger.info('Server error: ', error.message)
    process.exit(1)
  }
}

start()
