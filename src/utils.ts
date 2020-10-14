import delay from 'delay'
import { Sentry } from './sentry'

export function now() {
  return +new Date()
}

export async function loop(fn: () => Promise<void>, interval: number) {
  const lastTime = now()

  try {
    await fn()
  }
  catch (e) {
    Sentry.captureException(e)
  }

  const delta = Math.max(0, lastTime + interval - now())

  await delay(delta)

  loop(fn, interval)
}
