import { VOTE_REQUIREMENT } from './config'

export const TEMPLATE_VOTE = `
Knightly build will be enabled for this PR once this comment **receives ${VOTE_REQUIREMENT} thumbs up 👍**
`.trim()

export const TEMPLATE_VOTE_SATISFIED = (url: string) => `
✅ ~~${TEMPLATE_VOTE}~~

[See comment](${url})
`.trim()

export const TEMPLATE_BUILD_ENABLED = (npmLink: string) => `
![Nightly Build](https://github.com/knightlyjs/knightly/blob/main/res/badge.svg?raw=true)

Knightly build enabled, every night at 00:00 UTC <sup>(skip if no change)</sup>

📦 [npm package](${npmLink})
`.trim()

export const TEMPLATE_REPO_NOT_CONFIGURED = `
This repo does not have Knightly configured yet.

Please open a request issue to enable this repo in [knightlyjs/tasks](https://github.com/knightlyjs/tasks) first.
`.trim()
