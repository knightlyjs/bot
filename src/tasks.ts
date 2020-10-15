import pLimit from 'p-limit'
import { octokit } from './config'
import { logger } from './log'
import { tasks, removePullJob } from './store'

export async function cleanUpClosedPR() {
  logger.info('clean up PRs...')

  const limit = pLimit(10)

  const pTasks: Promise<any>[] = []

  for (const { owner, repo, pulls = [] } of tasks.value) {
    for (const pull_number of pulls) {
      pTasks.push(limit(async() => {
        const { data: pull } = await octokit.pulls.get({
          owner,
          repo,
          pull_number,
        })

        if (pull?.state !== 'open') {
          removePullJob({
            owner,
            repo,
            issue_number: pull_number,
          })
        }
      }))
    }
  }

  await Promise.all(pTasks)
}
