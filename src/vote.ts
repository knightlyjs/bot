import chalk from 'chalk'
import pLimit from 'p-limit'
import { ADMIN_HANDLES, octokit, VOTE_REQUIREMENT } from './config'
import { logger } from './log'
import { ThumbsUp } from './reactions'
import { Sentry } from './sentry'
import { addPullTask, getVoteInfo, hasPullTask, PullRequestInfo, store, VoteInfo } from './store'
import { TEMPLATE_VOTE, TEMPLATE_VOTE_SATISFIED } from './templates'

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

  ThumbsUp(pr, comment.id)
}

export async function updateVoteComment(vote: VoteInfo) {
  if (hasPullTask(vote))
    return

  await octokit.issues.updateComment({
    ...vote,
    body: TEMPLATE_VOTE_SATISFIED('//TODO: get npm package name'),
  })

  addPullTask(vote)
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

export async function checkVoteSatisfied(vote: VoteInfo) {
  if (!vote.satisfied) {
    const votes = (await getCommentVotes(vote)).filter(i => i.content === '+1')

    if (votes.length > VOTE_REQUIREMENT || votes.map(i => i.user.login).some(i => ADMIN_HANDLES.includes(i)))
      vote.satisfied = true
  }

  return vote.satisfied
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
              await updateVoteComment(vote)
            }
          }
          catch (e) {
            Sentry.captureException(e)
          }
        }),
      ),
  )
}
