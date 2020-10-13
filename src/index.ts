import { checkNotifications } from './notification'
import { store } from './store'
import { checkVoteSatisfied, updateVoteComment } from './vote'

async function run() {
  await store.file.waitForReady()

  await checkNotifications()

  console.log(store.value)

  const vote = store.value.votes[0]
  if (await checkVoteSatisfied(vote))
    await updateVoteComment(vote)
}

run()
