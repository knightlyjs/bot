import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import { SENTRY_DSN } from './config'

Sentry.init({ dsn: SENTRY_DSN })

export { Sentry, Tracing }
