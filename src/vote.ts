import { ADMIN_HANDLES, octokit, VOTE_REQUIREMENT } from './config'
import { getPrTask, getVoteInfo, PullRequestInfo, store, VoteInfo } from './store'
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

  octokit.reactions.createForIssueComment({
    ...pr,
    comment_id: comment.id,
    content: '+1',
  })
}

export async function updateVoteComment(vote: VoteInfo) {
  if (getPrTask(vote))
    return

  await octokit.issues.updateComment({
    ...vote,
    body: TEMPLATE_VOTE_SATISFIED('//TODO:'),
  })

  const {
    owner,
    repo,
    issue_number,
  } = vote

  store.value.prTasks.push({
    owner,
    repo,
    issue_number,
    active: true,
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

export async function checkVoteSatisfied(vote: VoteInfo) {
  if (!vote.satisfied) {
    const votes = (await getCommentVotes(vote)).filter(i => i.content === '+1')

    if (votes.length > VOTE_REQUIREMENT || votes.map(i => i.user.login).some(i => ADMIN_HANDLES.includes(i)))
      vote.satisfied = true
  }

  return vote.satisfied
}
