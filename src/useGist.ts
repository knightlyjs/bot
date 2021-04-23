import { Ref, shallowRef } from '@vue/reactivity'
import { watch } from '@vue-reactivity/watch'
import { throttle } from 'throttle-debounce'
import YAML from 'js-yaml'
import Base64 from 'js-base64'
import { octokit } from './config'
import { Sentry } from './sentry'

export function useGit<T>(owner: string, repo: string, filepath: string, init: T) {
  let writing = false

  const r = shallowRef(init) as Ref<T> & { ready: () => Promise<void> }

  async function fetch() {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filepath,
    })
    writing = true
    r.value = JSON.parse((data as any)?.content || '{}')
    writing = false
  }

  async function update(content: string) {
    try {
      return await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filepath,
        message: `chore: update "${filepath}"`,
        content: Base64.encode(content),
        author: {
          name: 'Knightly Bot',
          email: 'knightly-bot@antfu.me',
        },
      })
    }
    catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  const throttledUpdate = throttle(10 * 1000, update)

  watch(
    r,
    (v) => {
      if (writing)
        return
      throttledUpdate(JSON.stringify(v, null, 2))
    },
    { deep: true },
  )

  const _p = fetch()

  Object.defineProperty(r, 'ready', { value: () => _p })

  return r
}

export function useGist<T>(id: string, filename: string, init: T) {
  let writing = false
  const isYAML = filename.match(/\.ya?ml$/i)

  const r = shallowRef(init) as unknown as Ref<T> & { ready: () => Promise<void> }

  async function fetch() {
    const { data: gist } = await octokit.gists.get({ gist_id: id })
    writing = true
    r.value = isYAML
      ? YAML.load(gist.files?.[filename]?.content || '{}') as unknown as T
      : JSON.parse(gist.files?.[filename]?.content || '{}')
    writing = false
  }

  async function update(v: any) {
    try {
      await octokit.gists.update({
        gist_id: id,
        files: {
          [filename]: {
            filename,
            content: isYAML
              ? YAML.dump(v)
              : JSON.stringify(v, null, 2),
          },
        },
      })
    }
    catch (e) {
      Sentry.captureException(e)
      throw e
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
