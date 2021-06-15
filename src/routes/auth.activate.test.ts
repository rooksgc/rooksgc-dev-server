import request from 'supertest'
import { app, API_PATH } from '../index'
import { authService } from 'services/auth'
import { SecretTypes } from 'services/secret'

const { sequelize } = require('database/models')
const { User, Secret } = require('database/models')

describe('activate routes', () => {
  beforeAll(async () => {
    await User.sync({ force: true })
    await Secret.sync({ force: true })

    const password = await authService.hashPassword('aY8djw9~aj')

    await User.bulkCreate([
      {
        id: 1,
        name: 'Tony',
        email: 'tony@gmail.com',
        password,
        role: 'USER',
        is_active: false,
        contacts: null,
        channels: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

    await Secret.bulkCreate([
      {
        user_id: 1,
        public_code: '2d2Fd-Nd32d-2Wd3d-2dcxH',
        secret_type: SecretTypes.EMAIL_CONFIRMATION
      }
    ])
  })

  afterAll(async () => {
    sequelize.queryInterface.bulkDelete('Users', null, {})
    sequelize.queryInterface.bulkDelete('Secrets', null, {})
  })

  it('new user correct activation', async () => {
    const code = '2d2Fd-Nd32d-2Wd3d-2dcxH'
    const response = await request(app)
      .patch(`${API_PATH}/auth/activate/${code}`)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body.type).toBe('success')
    expect(response.body.message).toBe(
      `Активация прошла успешно. Вы можете перейти на страницу логина для входа.`
    )
  })

  it('incorrect secret code', async () => {
    const code = 'incorrect-secret-code'
    const response = await request(app)
      .patch(`${API_PATH}/auth/activate/${code}`)
      .expect('Content-Type', /json/)
      .expect(401)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe(
      `Ошибка активации пользователя. Попробуйте повторить операцию восстановления пароля.`
    )
  })
})
