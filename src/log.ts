import { createLogger, transports, format } from 'winston'

export const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.splat(),
        format.timestamp({ format: 'MM/DD HH:mm' }),
        format.printf(info => `${info.level} ${info.timestamp} | ${info.message}${info.splat !== undefined ? `${info.splat}` : ' '}`),
      ),
    }),
    new transports.File({
      format: format.json(),
      filename: 'error.log',
      level: 'error',
    }),
  ],
})
