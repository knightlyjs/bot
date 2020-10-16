import { KnightlyTask } from 'knightly'
import { octokit } from './config'
import { PullRequestInfo } from './store'

export async function dispatchOnCall(repoTask: KnightlyTask, pr: PullRequestInfo) {
  const tasks: KnightlyTask[] = [{
    ...repoTask,
    branches: [],
    pulls: [pr.issue_number],
    enabled: true,
  }]
  const { data } = await octokit.actions.createWorkflowDispatch({
    owner: 'knightlyjs',
    repo: 'tasks',
    // On Call, check out https://api.github.com/repos/knightlyjs/tasks/actions/workflows
    workflow_id: 3030813,
    ref: 'main',
    inputs: {
      tasks: JSON.stringify(tasks),
    },
  })

  return data
}
