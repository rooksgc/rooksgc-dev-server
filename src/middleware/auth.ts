import config from 'config'
import expressJwt from 'express-jwt'

const jwtSecret = config.get('jwt.secret')
const jwtAlgorithms = config.get('jwt.algorithms')

const authMiddleware = expressJwt({
  algorithms: [`${jwtAlgorithms}`],
  secret: jwtSecret
})

export { authMiddleware }
