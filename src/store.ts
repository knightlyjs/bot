import { useJSON } from '@vue-reactivity/fs'

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
  prTasks: PullRequestTask[]
}

export const store = useJSON<Store>('store.json', {
  space: 2,
  initialValue: {
    votes: [],
    prTasks: [],
  },
})

export function isSamePR(a: PullRequestInfo, b: PullRequestInfo) {
  return a.owner === b.owner && a.repo === b.repo && a.issue_number === b.issue_number
}

export function getVoteInfo(info: PullRequestInfo) {
  return store.value.votes.find(i => isSamePR(i, info))
}

export function getPrTask(info: PullRequestInfo) {
  return store.value.prTasks.find(i => isSamePR(i, info))
}
