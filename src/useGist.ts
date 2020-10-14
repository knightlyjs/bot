import { Ref, ref } from '@vue/reactivity'
import { watch } from '@vue-reactivity/watch'
import { throttle } from 'throttle-debounce'
import YAML from 'js-yaml'
import { octokit } from './config'
import { Sentry } from './sentry'

export function useGist<T>(id: string, filename: string, init: T) {
  let writing = false

  const r = ref(init) as unknown as Ref<T> & { ready: () => Promise<void> }

  async function fetch() {
    const { data: gist } = await octokit.gists.get({ gist_id: id })
    writing = true
    r.value = YAML.safeLoad(gist.files[filename].content || '{}') as unknown as T
    writing = false
  }

  async function update(v: any) {
    try {
      await octokit.gists.update({
        gist_id: id,
        files: {
          [filename]: {
            filename,
            content: YAML.safeDump(v),
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
