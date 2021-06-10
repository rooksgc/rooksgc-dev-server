import request from 'supertest'
import { app } from '../index'

describe('Auth routes', () => {
  it('Should handle /auth/login request with correct credentials', async (done) => {
    const email = 'rooksgc@gmail.com'
    const password = '1q1q2wAZSS'

    await request(app)
      .post('/auth/login')
      .send({ email, password })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(
        200,
        {
          type: 'success',
          message: 'Успешный вход в систему!'
        },
        done
      )
  })
})
