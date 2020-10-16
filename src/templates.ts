import { VOTE_REQUIREMENT } from './config'

export const TEMPLATE_VOTE = `
Knightly build will be enabled for this PR once this comment **receives ${VOTE_REQUIREMENT} thumbs up 👍**
`.trim()

export const TEMPLATE_VOTE_SATISFIED = (url: string) => `
✅ ~~${TEMPLATE_VOTE}~~

[See comment](${url})
`.trim()

export const TEMPLATE_BUILD_ENABLED = (npmLink: string) => `
<!--KNIGHTLY-BUILD-ENABLED-->

[![Nightly Build](https://github.com/knightlyjs/knightly/blob/main/res/badge.svg?raw=true)](https://github.com/knightlyjs/knightly)

🌒 Knightly build enabled, release every night at 00:00 UTC <sup>(skip if no change)</sup>

📦 [npm package](${npmLink})
`.trim()

export const TEMPLATE_REPO_NOT_CONFIGURED = `
This repo does not have Knightly configured yet.

Please open a request issue to enable this repo in [knightlyjs/tasks](https://github.com/knightlyjs/tasks/issues/new?assignees=&labels=repo-request&template=knightly-build-request.md) first.
`.trim()

export const TEMPLATE_REPO_ON_CALL_START = (npmLink: string) => `
Releases will be live on [npm](${npmLink}) soon. [Progress](https://github.com/knightlyjs/tasks/actions?query=workflow%3A%22On+Call%22)
`.trim()
