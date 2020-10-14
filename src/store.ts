import { useGist } from './gist'

export interface PullRequestInfo {
  owner: string
  repo: string
  issue_number: number
}

export interface VoteInfo extends PullRequestInfo {
  comment_id: number
  satisfied: boolean
}

export interface PullRequestTask extends PullRequestInfo {
  active: boolean
}

export interface Store {
  votes: VoteInfo[]
  pull_tasks: PullRequestTask[]
}

export const store = useGist<Store>({
  votes: [],
  pull_tasks: [],
})

export function isSamePR(a: PullRequestInfo, b: PullRequestInfo) {
  return a.owner === b.owner && a.repo === b.repo && a.issue_number === b.issue_number
}

export function getVoteInfo(info: PullRequestInfo) {
  return store.value.votes.find(i => isSamePR(i, info))
}

export function getPullTask(info: PullRequestInfo) {
  return store.value.pull_tasks.find(i => isSamePR(i, info))
}
