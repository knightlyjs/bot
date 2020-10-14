import { octokit } from './config'
import { PullRequestInfo } from './store'

export async function ReactTo({ owner, repo }: PullRequestInfo, comment_id: number, reaction: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray' | 'rocket' | 'eyes') {
  const { data } = await octokit.reactions.createForIssueComment({
    owner,
    repo,
    comment_id,
    content: reaction,
  })

  return data
}

export function ThumbsUp(pull: PullRequestInfo, comment_id: number) {
  return ReactTo(pull, comment_id, '+1')
}

export function Confused(pull: PullRequestInfo, comment_id: number) {
  return ReactTo(pull, comment_id, 'confused')
}
