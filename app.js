const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const app = express()
const PORT = config.get('port')
const authRouter = require('./routes/auth')
const linkRouter = require('./routes/link')
const redirectRoutes = require('./routes/redirect')
const path = require('path')

app.use(express.json({ extended: true }))

// routes
app.use('/api/auth', authRouter)
app.use('/api/link', linkRouter)
app.use('/t', redirectRoutes)

async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`))
  } catch(error) {
    console.log('Server error: ', error.message)
    process.exit(1)
  }
}

start()
