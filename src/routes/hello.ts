import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  return res.json({ message: 'Server test ok on /hello route' })
})

export default router
