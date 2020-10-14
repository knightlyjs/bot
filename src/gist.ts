import { Ref, ref } from '@vue/reactivity'
import { watch } from '@vue-reactivity/watch'
import { throttle } from 'throttle-debounce'
import { KNIGHTLY_BOT_STORE_GIST, octokit } from './config'
import { Sentry } from './sentry'

export function useGist<T>(init: T) {
  let writing = false

  const r = ref(init) as unknown as Ref<T> & { ready: () => Promise<void> }

  async function fetch() {
    const { data: gist } = await octokit.gists.get({ gist_id: KNIGHTLY_BOT_STORE_GIST })
    writing = true
    r.value = JSON.parse(gist.files['store.json'].content || '{}')
    writing = false
  }

  async function update(v: any) {
    try {
      await octokit.gists.update({
        gist_id: KNIGHTLY_BOT_STORE_GIST,
        files: {
          'store.json': {
            filename: 'store.json',
            content: JSON.stringify(v, null, 2),
          },
        },
      })
    }
    catch (e) {
      Sentry.captureException(e)
      console.error(e)
    }
  }

  const throttledUpdate = throttle(10 * 1000, update)

  watch(
    r,
    (v) => {
      if (writing)
        return
      throttledUpdate(v)
    },
    { deep: true },
  )

  const _p = fetch()

  Object.defineProperty(r, 'ready', { value: () => _p })

  return r
}
