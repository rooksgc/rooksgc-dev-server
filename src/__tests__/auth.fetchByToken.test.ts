import request from 'supertest'
import { app, API_PATH } from '../index'
import { authService } from 'services/auth'

const { sequelize } = require('database/models')
const { User } = require('database/models')

describe('fetch by token routes', () => {
  beforeAll(async () => {
    await User.sync({ force: true })

    const password = await authService.hashPassword('j38HgfjP~')

    await User.bulkCreate([
      {
        name: 'Maria',
        email: 'maria@gmail.com',
        password,
        role: 'USER',
        is_active: true,
        contacts: null,
        channels: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  })

  afterAll(async () => {
    await sequelize.queryInterface.bulkDelete('Users', null, {})
  })

  it('fetch existing user by jwt token', async () => {
    const email = 'maria@gmail.com'
    const password = 'j38HgfjP~'

    const loginRequest = await request(app)
      .post(`${API_PATH}/auth/login`)
      .send({ email, password })

    const { token, data: userData } = loginRequest.body

    const response = await request(app)
      .post(`${API_PATH}/auth/fetch-by-token`)
      .send({ token })
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body.type).toBe('success')
    expect(response.body.data).toEqual(userData)
  })

  it('token invalid or not found', async () => {
    const email = 'maria@gmail.com'
    const password = 'j38HgfjP~'
    const token = 'invalid-token'

    await request(app).post(`${API_PATH}/auth/login`).send({ email, password })

    const response = await request(app)
      .post(`${API_PATH}/auth/fetch-by-token`)
      .send({ token })
      .expect('Content-Type', /json/)
      .expect(401)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toEqual('JsonWebTokenError')
  })
})
