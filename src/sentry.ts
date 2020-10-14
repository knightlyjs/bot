import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

Sentry.init({
  dsn: 'https://41deb8927fa84a4ea7e414e892ef0bb5@o208211.ingest.sentry.io/5463051',
})

export { Sentry, Tracing }
