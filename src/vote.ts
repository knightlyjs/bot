import { notNullish } from '@antfu/utils'
import chalk from 'chalk'
import { KnightlyTask } from 'knightly'
import pLimit from 'p-limit'
import { ADMIN_HANDLES, octokit, VOTE_REQUIREMENT } from './config'
import { logger } from './log'
import { dispatchOnCall } from './oncall'
import { thumbsUp } from './reactions'
import { Sentry } from './sentry'
import { addPullJob, getRepoTask, getVoteInfo, hasPullJob, PullRequestInfo, store, VoteInfo } from './store'
import { TEMPLATE_BUILD_ENABLED, TEMPLATE_VOTE, TEMPLATE_VOTE_SATISFIED } from './templates'

export async function createVoteComment(pr: PullRequestInfo) {
  if (getVoteInfo(pr))
    return

  const { data: comment } = await octokit.issues.createComment({
    ...pr,
    body: TEMPLATE_VOTE,
  })

  store.value.votes.push({
    ...pr,
    comment_id: comment.id,
    satisfied: false,
  })

  thumbsUp(pr, comment.id)
}

export function getNpmLink(task: KnightlyTask, pull: PullRequestInfo) {
  return `https://www.npmjs.com/package/${task.publishName}/v/pr${pull.issue_number}`
}

export async function startBuildFor(task: KnightlyTask, pull: PullRequestInfo) {
  const { data: comment } = await octokit.issues.createComment({
    ...pull,
    body: TEMPLATE_BUILD_ENABLED(getNpmLink(task, pull)),
  })

  addPullJob(pull)

  await dispatchOnCall(task, pull)

  return comment
}

export async function updateVoteCommentSatisfied(vote: VoteInfo) {
  const repo = getRepoTask(vote)
  if (!repo || hasPullJob(vote))
    return

  const comment = await startBuildFor(repo, vote)

  octokit.issues.updateComment({
    ...vote,
    body: TEMPLATE_VOTE_SATISFIED(comment.url),
  })
}

export async function getCommentVotes({ owner, repo, issue_number, comment_id }: VoteInfo) {
  const { data } = await octokit.reactions.listForIssueComment({
    owner,
    repo,
    issue_number,
    comment_id,
  })

  return data
}

export async function checkVoteSatisfied(vote: VoteInfo, task?: KnightlyTask) {
  if (!vote.satisfied) {
    const votes = (await getCommentVotes(vote)).filter(i => i.content === '+1')
    task = task || getRepoTask(vote)

    if (votes.length > VOTE_REQUIREMENT || votes.map(i => i.user?.login).filter(notNullish).some(i => isMaintainer(i, task)))
      vote.satisfied = true
  }

  return vote.satisfied
}

export async function isMaintainer(login: string, task?: KnightlyTask) {
  return [...ADMIN_HANDLES, ...(task?.maintainers || [])].filter(notNullish).includes(login) && login
}

export async function checkVotes() {
  logger.info('checking votes...')

  const limit = pLimit(10)

  await Promise.all(
    store.value.votes
      .filter(v => !v.satisfied)
      .map(vote =>
        limit(async() => {
          try {
            if (await checkVoteSatisfied(vote)) {
              logger.info(`vote satisfied from ${chalk.green(`${vote.owner}/${vote.repo}#${vote.issue_number}`)}`)
              await updateVoteCommentSatisfied(vote)
            }
          }
          catch (e) {
            Sentry.captureException(e)
          }
        }),
      ),
  )
}
