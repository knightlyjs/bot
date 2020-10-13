import { VOTE_REQUIREMENT } from './config'

export const TEMPLATE_VOTE = `
Knightly build will enabled for this PR once this comment **receives ${VOTE_REQUIREMENT} thumbs up 👍**
`.trim()

export const TEMPLATE_VOTE_SATISFIED = (npmLink: string) => `
✅ ~~${TEMPLATE_VOTE}~~

🌓 Knightly build enabled, every night at 00:00 UTC <sup>(skip if no change)</sup>

📦 [npm package](${npmLink})
`.trim()
