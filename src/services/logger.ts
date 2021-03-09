import { createLogger, format, transports, Logger } from 'winston'

const LoggerService = (): Logger => {
  const logFormat = format.combine(
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    format.align(),
    format.printf(
      (i) => `[${i.timestamp}] [${i.level.toUpperCase()}] ${i.message}`
    ),
    format.colorize()
  )

  const logger = createLogger({
    level: 'info',
    transports: [
      new transports.File({
        filename: 'logs/errors.log',
        handleExceptions: true,
        format: logFormat
      })
    ],
    exitOnError: () => {
      return true
    }
  })

  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new transports.Console({
        format: logFormat
      })
    )
  }

  return logger
}

export default LoggerService
