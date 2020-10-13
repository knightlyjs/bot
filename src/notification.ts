import { BOT_NAME, octokit } from './config'
import { PullRequestInfo } from './store'
import { createVoteComment } from './vote'

export async function checkNotifications() {
  const notifications = (await octokit.activity.listNotificationsForAuthenticatedUser({ all: false }))
    .data
    .filter(
      i => i.reason === 'mention' && i.subject.type === 'PullRequest',
    )
  await octokit.activity.markNotificationsAsRead()

  await Promise.all(
    await notifications.map(async(i) => {
      const matches = /api\.github\.com\/repos\/(.+?)\/(.+?)\/pulls\/(.+?)/.exec(
        i.subject.url,
      )
      if (!matches)
        return

      const [, owner, repo, issue_number] = matches
      const {
        data: { body },
      } = await octokit.request(i.subject.latest_comment_url)

      const pr: PullRequestInfo = {
        owner, repo, issue_number: +issue_number,
      }

      if (new RegExp(`@${BOT_NAME} build this`, 'i').exec(body))
        await createVoteComment(pr)
    }),
  )
}
