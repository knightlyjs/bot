import chalk from 'chalk'
import pLimit from 'p-limit'
import { BOT_NAME, octokit } from './config'
import { logger } from './log'
import { PullRequestInfo } from './store'
import { createVoteComment } from './vote'

export async function checkNotifications() {
  logger.info('checking notifications...')

  const notifications = (await octokit.activity.listNotificationsForAuthenticatedUser({ all: false }))
    .data
    .filter(i => i.reason === 'mention' && i.subject.type === 'PullRequest')
  await octokit.activity.markNotificationsAsRead()

  const limit = pLimit(5)

  await Promise.all(notifications.map(i =>
    limit(async() => {
      const matches = /api\.github\.com\/repos\/(.+?)\/(.+?)\/pulls\/(.+?)/.exec(
        i.subject.url,
      )
      if (!matches)
        return

      const [, owner, repo, issue_number] = matches
      const pr: PullRequestInfo = {
        owner, repo, issue_number: +issue_number,
      }

      const {
        data: { body, user },
      } = await octokit.request(i.subject.latest_comment_url)

      logger.info(`comment received on ${owner}/${repo}#${issue_number}(@${user?.login}) ${chalk.blue(body)}`)

      if (new RegExp(`@${BOT_NAME} build this`, 'i').exec(body))
        await createVoteComment(pr)
    })),
  )
}
