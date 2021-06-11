import { NextFunction, Request, Response } from 'express'
import { loggerService as logger } from 'services/logger'

const ERROR_DEFAULT_MESSAGE = 'Internal Server Error'
const ERROR_DEFAULT_TYPE = 'error'
const ERROR_DEFAULT_STATUS_CODE = 500

interface ErrorType {
  type: string
  message: string
  statusCode: number
}

const errorMiddleware = (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction
): unknown => {
  if (!err) next()

  const type = err.type || ERROR_DEFAULT_TYPE
  const message = err.message || ERROR_DEFAULT_MESSAGE
  const statusCode = err.statusCode || ERROR_DEFAULT_STATUS_CODE
  const ip = req.ip.split(':').pop()

  if (statusCode >= 500) {
    logger.error(`[${ip}] ${statusCode} ${message}`)
  }
  
  return res.status(statusCode).json({ type, message })
}

export { errorMiddleware }
