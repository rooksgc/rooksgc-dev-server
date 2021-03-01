import config from 'config'
import expressJwt from 'express-jwt'

const jwtSecret = config.get('jwt.secret')
const jwtAlgorithms = config.get('jwt.algorithms')

// todo
// const isRevokedCallback = (req, payload, done) => {
//   const tokenId = payload.jti

//   data.getRevokedToken(tokenId, function (err, token) {
//     if (err) {
//       return done(err)
//     }
//     return done(null, !!token)
//   })
// }

const jwtMiddleWare = expressJwt({
  algorithms: [`${jwtAlgorithms}`],
  secret: jwtSecret
  // isRevoked: isRevokedCallback
})

export default jwtMiddleWare
