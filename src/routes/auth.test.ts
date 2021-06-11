import request from 'supertest'
import { app, API_PATH } from '../index'

describe('Auth routes', () => {
  describe('login', () => {
    it('correct credentials', async () => {
      const email = 'demo@gmail.com'
      const password = '1212qQ'

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
      const email = 'wrongusername@gmail.com'
      const password = '12qwerDS'

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
      const email = 'demo@gmail.com'
      const password = '12qwSA6'

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
