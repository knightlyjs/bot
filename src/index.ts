import { checkBotName } from './auth'
import { checkNotifications } from './notification'
import { store } from './store'
import { loop } from './utils'
import { checkVotes } from './vote'

const minute = 60 * 1000

async function run() {
  await checkBotName()
  await store.ready()

  loop(checkNotifications, 1 * minute)
  loop(checkVotes, 15 * minute)
}

run()