import { BOT_NAME, KNIGHTLY_BOT_STORE_GIST, octokit } from './config'

export async function checkBotName() {
  if (!KNIGHTLY_BOT_STORE_GIST) {
    console.error('Invalid KNIGHTLY_BOT_STORE_GIST is provided.')
    process.exit(1)
  }

  try {
    const { data: user } = await octokit.users.getAuthenticated()

    if (!user || user.login !== BOT_NAME) {
      console.error('Invalid GITHUB_TOKEN is provided.')
      process.exit(1)
    }
  }
  catch (e) {
    console.error(e)
    process.exit(1)
  }
}
