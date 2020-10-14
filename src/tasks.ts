import { resolveUserConfig } from 'knightly'
import pLimit from 'p-limit'
import { octokit } from './config'
import { logger } from './log'
import { tasks, removePullTask } from './store'

export async function cleanUpClosedPR() {
  logger.info('clean up PRs...')

  const items = resolveUserConfig(tasks.value)
  const limit = pLimit(10)

  const pTasks: Promise<any>[] = []

  for (const { owner, repo, pulls = [] } of items) {
    for (const pull_number of pulls) {
      pTasks.push(limit(async() => {
        const { data: pull } = await octokit.pulls.get({
          owner,
          repo,
          pull_number,
        })

        if (pull?.state !== 'open') {
          await removePullTask({
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
