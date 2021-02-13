const router = require('express').Router()

router.get('/', (req, res) => {
  return res.json({ message: 'Server test ok on /hello route' })
})

module.exports = router
