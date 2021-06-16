import request from 'supertest'
import { app, API_PATH } from '../index'
import { authService } from 'services/auth'
import { SecretTypes } from 'services/secret'

const { sequelize } = require('database/models')
const { User, Secret } = require('database/models')

describe('check secret routes', () => {
  beforeAll(async () => {
    await User.sync({ force: true })
    await Secret.sync({ force: true })

    const password = await authService.hashPassword('aY8djw9~aj')

    await User.bulkCreate([
      {
        id: 1,
        name: 'Mary',
        email: 'mary@yandex.ru',
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
        public_code: 'd4w3ed-edp5w8-ed4wj-dek7wx',
        secret_type: SecretTypes.EMAIL_CONFIRMATION
      }
    ])
  })

  afterAll(async () => {
    sequelize.queryInterface.bulkDelete('Users', null, {})
    sequelize.queryInterface.bulkDelete('Secrets', null, {})
  })

  it('valid secret code', async () => {
    const code = 'd4w3ed-edp5w8-ed4wj-dek7wx'
    const secretType = SecretTypes.EMAIL_CONFIRMATION

    const response = await request(app)
      .post(`${API_PATH}/auth/check-secret`)
      .send({ code, secretType })
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body.type).toBe('success')
  })

  it('secret code invalid or not found', async () => {
    const code = 'missing-secret-code'
    const secretType = SecretTypes.EMAIL_CONFIRMATION

    const response = await request(app)
      .post(`${API_PATH}/auth/check-secret`)
      .send({ code, secretType })
      .expect('Content-Type', /json/)
      .expect(404)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe(
      'Ошибка смены пароля: неверный или уже использованный секретный код'
    )
  })

  it('invalid secretType', async () => {
    const code = 'd4w3ed-edp5w8-ed4wj-dek7wx'
    const secretType = 'user_confirmation'

    const response = await request(app)
      .post(`${API_PATH}/auth/check-secret`)
      .send({ code, secretType })
      .expect('Content-Type', /json/)
      .expect(400)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe('Internal Server Error')
  })
})
