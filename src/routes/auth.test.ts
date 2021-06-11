import request from 'supertest'
import { app, API_PATH } from '../index'
import { authService } from 'services/auth'

const { sequelize } = require('database/models')
const { User } = require('database/models')

describe('Auth routes', () => {
  beforeAll(async () => {
    await User.sync({ force: true })

    const password = await authService.hashPassword('aY8djw9~aj')
    
    await User.bulkCreate([
      {
        name: 'John',
        email: 'john@gmail.com',
        password,
        role: 'USER',
        is_active: true,
        contacts: null,
        channels: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  });

  afterAll( async() => {
    sequelize.queryInterface.bulkDelete('Users', null, {})
  })

  describe('login', () => {
    it('correct credentials', async () => {
      const email = 'john@gmail.com'
      const password = 'aY8djw9~aj'

      const response = await request(app)
        .post(`${API_PATH}/auth/login`)
        .send({ email, password })
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body.type).toBe('success')
      expect(response.body.message).toBe('Успешный вход в систему!')
      expect(response.body.token).toBeDefined()
      expect(response.body.data).toBeDefined()
    })

    it('wrong email', async () => {
      const email = 'wrongmail@gmail.com'
      const password = 'aY8djw9~aj'

      const response = await request(app)
        .post(`${API_PATH}/auth/login`)
        .send({ email, password })
        .expect('Content-Type', /json/)
        .expect(409)

      expect(response.body.type).toBe('error')
      expect(response.body.message).toBe(
        'Пользователя с таким email не существует'
      )
      expect(response.body.token).not.toBeDefined()
      expect(response.body.data).not.toBeDefined()
    })

    it('wrong password', async () => {
      const email = 'john@gmail.com'
      const password = 'x2qwFSA6n'

      const response = await request(app)
        .post(`${API_PATH}/auth/login`)
        .send({ email, password })
        .expect('Content-Type', /json/)
        .expect(401)

      expect(response.body.type).toBe('error')
      expect(response.body.message).toBe('Неверный пароль')
      expect(response.body.token).not.toBeDefined()
      expect(response.body.data).not.toBeDefined()
    })
  })
})
