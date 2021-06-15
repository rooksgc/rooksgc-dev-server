import request from 'supertest'
import { app, API_PATH } from '../index'
import { authService } from 'services/auth'

const { sequelize } = require('database/models')
const { User, Secret } = require('database/models')

describe('register routes', () => {
  beforeAll(async () => {
    await User.sync({ force: true })
    await Secret.sync({ force: true })

    const password = await authService.hashPassword('j83nd7JhgfD')
    await User.bulkCreate([
      {
        name: 'Andrew',
        email: 'andrew@mail.ru',
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
    sequelize.queryInterface.bulkDelete('Users', null, {})
    sequelize.queryInterface.bulkDelete('Secrets', null, {})
  })

  it('correct password recovery', async () => {
    const email = 'andrew@mail.ru'

    const response = await request(app)
      .post(`${API_PATH}/auth/recover`)
      .send({ email })
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body.type).toBe('success')
    expect(response.body.message).toBe(
      `Ссылка для смены пароля отправлена на email ${email}. Проверьте Вашу почту!`
    )
  })

  it('email does not exists', async () => {
    const email = 'alex@mail.ru'

    const response = await request(app)
      .post(`${API_PATH}/auth/recover`)
      .send({ email })
      .expect('Content-Type', /json/)
      .expect(409)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe(
      'Пользователя с таким email не существует'
    )
  })

  it('invalid email handling', async () => {
    const email = 'wrongmail.gmail.com'

    const response = await request(app)
      .post(`${API_PATH}/auth/recover`)
      .send({ email })
      .expect('Content-Type', /json/)
      .expect(400)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe('Internal Server Error')
  })
})
