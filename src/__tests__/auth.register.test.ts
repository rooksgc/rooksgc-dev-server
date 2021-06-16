import request from 'supertest'
import { app, API_PATH } from '../index'
import { authService } from 'services/auth'

const { sequelize } = require('database/models')
const { User, Secret } = require('database/models')

describe('register routes', () => {
  beforeAll(async () => {
    await User.sync({ force: true })
    await Secret.sync({ force: true })

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

  it('correct register', async () => {
    const name = 'user1'
    const email = 'user1@gmail.com'
    const password = 'usr12J8J9d'

    const response = await request(app)
      .put(`${API_PATH}/auth/register`)
      .send({ name, email, password })
      .expect('Content-Type', /json/)
      .expect(201)

    expect(response.body.type).toBe('success')
    expect(response.body.message).toBe(
      `Пользователь создан. Активируйте свой аккаунт, выполнив переход по ссылке из письма, которое выслано на адрес: ${email}`
    )
  })

  it('invalid email should prevent register', async () => {
    const name = 'user2'
    const email = 'wrongmail.gmail.com'
    const password = 'user2j7fHD'

    const response = await request(app)
      .put(`${API_PATH}/auth/register`)
      .send({ name, email, password })
      .expect('Content-Type', /json/)
      .expect(400)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toContain('Invalid value')
  })

  it('invalid password should prevent register', async () => {
    const name = 'user3'
    const email = 'user3@gmail.com'
    const password = 'user20274c'

    const response = await request(app)
      .put(`${API_PATH}/auth/register`)
      .send({ name, email, password })
      .expect('Content-Type', /json/)
      .expect(400)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toContain(
      'Пароль должен содержать не менее 6 символов латинского алфавита'
    )
  })

  it('duplicate email should return error', async () => {
    const name = 'user4'
    const email = 'john@gmail.com'
    const password = '12asUJH'

    const response = await request(app)
      .put(`${API_PATH}/auth/register`)
      .send({ name, email, password })
      .expect('Content-Type', /json/)
      .expect(409)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe(
      'Email уже существует! Выберите другой адрес.'
    )
  })

  it('duplicate user name should return error', async () => {
    const name = 'Alex'
    const email = 'superalex@gmail.com'
    const password = '12asKugvH'

    const response = await request(app)
      .put(`${API_PATH}/auth/register`)
      .send({ name, email, password })
      .expect('Content-Type', /json/)
      .expect(409)

    expect(response.body.type).toBe('error')
    expect(response.body.message).toBe(
      'Имя занято! Придумайте другое имя пользователя.'
    )
  })
})
