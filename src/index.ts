import express from 'express'
import config from 'config'
const app = express()
const PORT = config.get('port')
import helloRoutes from './routes/hello'

// todo fix type
app.use(express.json({ extended: true } as unknown))

// routes
app.use('/api/hello', helloRoutes)

async function start() {
  try {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`))
  } catch (error) {
    console.log('Server error: ', error.message)
    process.exit(1)
  }
}

start()
