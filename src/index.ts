import minimist from 'minimist'
import { checkBotName } from './auth'
import { checkNotifications } from './notification'
import { store, tasks } from './store'
import { cleanUpClosedPR } from './tasks'
import { loop } from './utils'
import { checkVotes } from './vote'

const argv = minimist(process.argv.slice(2))

const minute = 60 * 1000

async function run() {
  await checkBotName()
  await store.ready()
  await tasks.ready()

  const run = argv.loop ? loop : (fn: Function) => fn()

  if (argv[0] === 'cleanup') {
    run(cleanUpClosedPR, 60 * minute)
  }
  else {
    run(checkNotifications, 1 * minute)
    run(checkVotes, 15 * minute)
  }
}

run()
