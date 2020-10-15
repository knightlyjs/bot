import chalk from 'chalk'
import pLimit from 'p-limit'
import { BOT_NAME, octokit } from './config'
import { logger } from './log'
import { Confused } from './reactions'
import { getRepoTask, hasPullJob } from './store'
import { TEMPLATE_REPO_NOT_CONFIGURED } from './templates'
import { getCommentIfFromUrl, getPullInfoFromUrl } from './utils'
import { createVoteComment, isMaintainer, startBuildFor } from './vote'

const REGEX_PIN_BOT = new RegExp(`@${BOT_NAME}`, 'i')
const REGEX_BUILD_THIS = new RegExp(`@${BOT_NAME} build this`, 'i')

export async function checkNotifications() {
  logger.info('checking notifications...')

  const notifications = (await octokit.activity.listNotificationsForAuthenticatedUser({ all: false }))
    .data
    .filter(i => i.reason === 'mention' && i.subject.type === 'PullRequest')
  octokit.activity.markNotificationsAsRead()

  const limit = pLimit(5)

  await Promise.all(notifications.map(i =>
    limit(async() => {
      const pr = getPullInfoFromUrl(i.subject.url)
      const comment_id = getCommentIfFromUrl(i.subject.latest_comment_url)
      if (!pr || !comment_id)
        return

      const {
        data: { body, user },
      } = await octokit.issues.getComment({
        ...pr,
        comment_id,
      })

      logger.info(`comment received on ${chalk.green(`${pr.owner}/${pr.repo}#${pr.issue_number}(@${user?.login})`)} ${chalk.blue(body)}`)

      if (!body.match(REGEX_PIN_BOT))
        return

      if (body.match(REGEX_BUILD_THIS)) {
        const task = getRepoTask(pr)

        if (task) {
          if (hasPullJob(pr))
            return
          if (isMaintainer(user?.login))
            await startBuildFor(task, pr)
          else
            await createVoteComment(pr)
        }
        else {
          Confused(pr, comment_id)
          await octokit.issues.createComment({
            ...pr,
            body: TEMPLATE_REPO_NOT_CONFIGURED,
          })
        }
      }
      else {
        Confused(pr, comment_id)
      }
    })),
  )
}
