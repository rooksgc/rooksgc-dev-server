const express = require('express')
const config = require('config')
const app = express()
const PORT = config.get('port')
const helloRoutes = require('./routes/hello')

app.use(express.json({ extended: true }))

// Routes
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
