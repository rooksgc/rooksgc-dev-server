import request from 'supertest'
import { app, API_PATH } from '../index'
import { authService } from 'services/auth'
import { SecretTypes } from 'services/secret'

const { sequelize } = require('database/models')
const { User, Secret } = require('database/models')

describe('change password routes', () => {
  beforeAll(async () => {
    await User.sync({ force: true })
    await Secret.sync({ force: true })

    const password = await authService.hashPassword('k~9Kh76dhGd')

    await User.bulkCreate([
      {
        id: 1,
        name: 'Garry',
        email: 'garry@gmail.com',
        password,
        role: 'USER',
        is_active: true,
        contacts: null,
        channels: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

    await Secret.bulkCreate([
      {
        user_id: 1,
        public_code: '4mdJ8-j7hj8-l298c-cmj297',
        secret_type: SecretTypes.RECOVER_PASSWORD
      }
    ])
  })

  afterAll(async () => {
    await sequelize.queryInterface.bulkDelete('Users', null, {})
    await sequelize.queryInterface.bulkDelete('Secrets', null, {})
  })

  it('correct code for password recovery', async () => {
    const code = '4mdJ8-j7hj8-l298c-cmj297'
    const password = 'newPassword002'

    const response = await request(app)
      .patch(`${API_PATH}/auth/change-password`)
      .send({ code, password })
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body.type).toBe('success')
    expect(response.body.message).toBe('Пароль успешно изменен!')
  })

  it('secret code not found', async () => {
    const code = 'wrong-secret-code'
    const password = 'newpassWordAgain78'

    const response = await request(app)
      .patch(`${API_PATH}/auth/change-password`)
      .send({ code, password })
      .expect('Content-Type', /json/)
      .expect(404)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe(
      'Ошибка смены пароля: неверный или уже использованный секретный код'
    )
  })

  it('user and secret codes was deleted', async () => {
    await sequelize.queryInterface.bulkDelete('Users', null, {})

    const code = '4mdJ8-j7hj8-l298c-cmj297'
    const password = 'newpassWordAgain78'

    const response = await request(app)
      .patch(`${API_PATH}/auth/change-password`)
      .send({ code, password })
      .expect('Content-Type', /json/)
      .expect(404)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe(
      'Ошибка смены пароля: неверный или уже использованный секретный код'
    )
  })
})
