import type { KnightlyTask } from 'knightly'
import { KNIGHTLY_BOT_GIST_STORE, KNIGHTLY_BOT_GIST_TASKS } from './config'
import { useGist } from './useGist'

export interface RepoInfo {
  owner: string
  repo: string
}

export interface PullRequestInfo extends RepoInfo {
  issue_number: number
}

export interface VoteInfo extends PullRequestInfo {
  comment_id: number
  satisfied: boolean
}

export interface Store {
  votes: VoteInfo[]
}

export const store = useGist<Store>(KNIGHTLY_BOT_GIST_STORE, 'store.json', {
  votes: [],
})

export const tasks = useGist<KnightlyTask[]>(KNIGHTLY_BOT_GIST_TASKS, 'tasks.json', [])

export function storeReady() {
  return Promise.all([
    store.ready(),
    tasks.ready(),
  ])
}

export function isSamePR(a: PullRequestInfo, b: PullRequestInfo) {
  return a.owner === b.owner && a.repo === b.repo && a.issue_number === b.issue_number
}

export function getVoteInfo(info: PullRequestInfo) {
  return store.value.votes.find(i => isSamePR(i, info))
}

export function getRepoTask({ owner, repo }: RepoInfo) {
  return tasks.value
    .find(i => i.repo === repo && i.owner === owner)
}

export function hasPullJob(info: PullRequestInfo) {
  const repo = getRepoTask(info)
  if (repo)
    return Boolean(repo.pulls?.includes(info.issue_number))
  return false
}

export function addPullJob(info: PullRequestInfo) {
  const repo = getRepoTask(info)
  if (repo) {
    repo.pulls = Array.from(new Set([...(repo.pulls || []), info.issue_number]))
    return true
  }
  return false
}

export function removePullJob(info: PullRequestInfo) {
  const repo = getRepoTask(info)
  if (repo?.pulls) {
    const index = repo.pulls.indexOf(info.issue_number)
    if (index >= 0) {
      repo.pulls.splice(index, 1)
      return true
    }
  }
  return false
}
