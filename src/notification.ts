import chalk from 'chalk'
import pLimit from 'p-limit'
import { BOT_NAME, octokit } from './config'
import { logger } from './log'
import { dispatchOnCall } from './oncall'
import { confused } from './reactions'
import { getRepoTask, hasPullJob, PullRequestInfo } from './store'
import { TEMPLATE_REPO_NOT_CONFIGURED, TEMPLATE_REPO_ON_CALL_START } from './templates'
import { getCommentIfFromUrl, getPullInfoFromUrl } from './utils'
import { createVoteComment, getNpmLink, isMaintainer, startBuildFor } from './vote'

const REGEX_PIN_BOT = new RegExp(`@${BOT_NAME}`, 'i')
const REGEX_BUILD_THIS = new RegExp(`@${BOT_NAME} build this`, 'i')
const REGEX_RELEASE_NOW = new RegExp(`@${BOT_NAME} release now`, 'i')

async function noConfigured(pr: PullRequestInfo) {
  await octokit.issues.createComment({
    ...pr,
    body: TEMPLATE_REPO_NOT_CONFIGURED,
  })
}

async function commandBuildThis(pr: PullRequestInfo, comment_id: number, login: string) {
  const task = getRepoTask(pr)
  if (!task) {
    confused(pr, comment_id)
    noConfigured(pr)
    return
  }

  if (hasPullJob(pr))
    return
  if (isMaintainer(login, task))
    await startBuildFor(task, pr)
  else
    await createVoteComment(pr)
}

async function commandReleaseNow(pr: PullRequestInfo, comment_id: number, login: string) {
  const task = getRepoTask(pr)

  if (!task) {
    confused(pr, comment_id)
    noConfigured(pr)
    return
  }

  if (!isMaintainer(login, task)) {
    confused(pr, comment_id)
    return
  }

  await dispatchOnCall(task, pr)
  octokit.issues.createComment({
    ...pr,
    body: TEMPLATE_REPO_ON_CALL_START(getNpmLink(task, pr)),
  })
}

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
      } = await octokit.issues.getComment({ ...pr, comment_id })

      logger.info(`comment received on ${chalk.green(`${pr.owner}/${pr.repo}#${pr.issue_number}(@${user?.login})`)} ${chalk.blue(body)}`)

      if (!body.match(REGEX_PIN_BOT))
        return

      const login = user.login

      if (body.match(REGEX_BUILD_THIS))
        await commandBuildThis(pr, comment_id, login)

      else if (body.match(REGEX_RELEASE_NOW))
        await commandReleaseNow(pr, comment_id, login)

      else
        confused(pr, comment_id)
    })),
  )
}
