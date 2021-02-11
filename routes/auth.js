const router = require('express').Router()
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const config = require('config')

router.post(
  '/register',
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Некорректный пароль. Минимальная длина пароля 6 символов')
      .isLength({min: 6}),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации'
        })
      }

      const {email, password} = req.body
      const candidate = await User.findOne({email})

      if (candidate) {
        return res.status(400).json({
          message: 'Пользователь с таким email уже существует.'
        })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const user = new User({email, password: hashedPassword})
      await user.save()

      res.status(201).json({message: 'Пользователь создан'})
    } catch (error) {
      return res.status(500).json({message: 'Что-то пошло не так.'})
    }
  }
)

router.post(
  '/login',
  [
    check('email', 'Некорректный email').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации'
        })
      }

      const {email, password} = req.body
      const user = await User.findOne({email})

      if (!user) {
        return res.status(400).json({
          message: 'Пользователь не найден'
        })
      }

      const isPasswordsMatch = await bcrypt.compare(password, user.password)
      if (!isPasswordsMatch) {
        return res.status(400).json({message: 'Неверный пароль'})
      }

      const token = jwt.sign(
        { userId: user.id },
        config.get('jwtSecret'),
        { expiresIn: '1h' }
      )

      res.json({ token, userId: user.id })
    } catch (error) {
      return res.status(500).json({message: 'Что-то пошло не так.'})
    }
  }
)

router.get('/test', (req, res) => {
  return res.json({message: 'Server test ok on /auth/test route.'})
})

module.exports = router
