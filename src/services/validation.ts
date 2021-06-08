import { Request } from 'express'

const { validationResult } = require('express-validator')

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
