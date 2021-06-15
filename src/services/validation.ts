import { Request } from 'express'

const { validationResult } = require('express-validator')

export const WRONG_PASSWORD_MESSAGE =
  'Пароль должен содержать не менее 6 символов латинского алфавита, включая 1 строчную и 1 прописную букву и хотя бы 1 цифру'

interface ExpressValidatorResponse {
  value: string
  msg: string
  param: string
  location: string
}

export interface ValidationServiceApi {
  validate(req: Request): string
}

const validationService: ValidationServiceApi = {
  validate(req: Request): string {
    return validationResult(req)
      .array()
      .reduce(
        (acc: string, err: ExpressValidatorResponse) =>
          acc.concat(`${err.msg}\n`),
        ''
      )
  }
}

export { validationService }
