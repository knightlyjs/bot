import delay from 'delay'
import { Sentry } from './sentry'
import { PullRequestInfo } from './store'

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

  if (interval < 0)
    return

  const delta = Math.max(0, lastTime + interval - now())

  await delay(delta)

  loop(fn, interval)
}

export function getPullInfoFromUrl(url: string) {
  const matches = /api\.github\.com\/repos\/(.+?)\/(.+?)\/pulls\/([0-9]+)$/.exec(url)
  if (!matches)
    return

  const [, owner, repo, issue_number] = matches

  if (+issue_number)
    return

  const pr: PullRequestInfo = {
    owner, repo, issue_number: +issue_number,
  }
  return pr
}

export function getCommentIfFromUrl(url: string) {
  return +url.split('/').splice(-1)[0]
}
