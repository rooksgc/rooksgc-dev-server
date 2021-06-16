import request from 'supertest'
import { app, API_PATH } from '../index'
import { authService } from 'services/auth'

const { sequelize } = require('database/models')
const { User } = require('database/models')

describe('login routes', () => {
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
      },
      {
        name: 'Alex',
        email: 'alex@mail.ru',
        password,
        role: 'USER',
        is_active: false,
        contacts: null,
        channels: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  })

  afterAll(async () => {
    await sequelize.queryInterface.bulkDelete('Users', null, {})
    await sequelize.queryInterface.bulkDelete('Secrets', null, {})
  })

  it('correct login for activated user', async () => {
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

  it('prevent login for non-activated user', async () => {
    const email = 'alex@mail.ru'
    const password = 'aY8djw9~aj'

    const response = await request(app)
      .post(`${API_PATH}/auth/login`)
      .send({ email, password })
      .expect('Content-Type', /json/)
      .expect(401)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe(
      'Учетная запись не активирована! Воспользуйтесь ссылкой для активации, ранее высланной на Ваш адрес электронной почты.'
    )
    expect(response.body.token).not.toBeDefined()
    expect(response.body.data).not.toBeDefined()
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
  })
})
