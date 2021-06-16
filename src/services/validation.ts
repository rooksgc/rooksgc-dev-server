import { Request } from 'express'

const { validationResult } = require('express-validator')

export const INVALID_PASSWORD =
  'Пароль должен содержать не менее 6 символов латинского алфавита, включая 1 строчную и 1 прописную букву и хотя бы 1 цифру'
export const INVALID_SECRET_CODE = 'Неверный формат секретного кода'
export const INVALID_SECRET_TYPE = 'Неверный формат типа секретного кода'

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
