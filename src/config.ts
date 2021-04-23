import { Octokit } from '@octokit/rest'
import dotenv from 'dotenv'

const { parsed } = dotenv.config({})
const env = { ...process.env, ...parsed } as Record<string, string>

/**
 * GitHub handles for admin,
 *
 * when one of the admin vote on the build request,
 * the request will be accepted regardless of the vote count
 */
export const ADMIN_HANDLES = [
  'antfu',
]

export const GITHUB_TOKEN = env.GITHUB_TOKEN
export const SENTRY_DSN = env.SENTRY_DSN
export const HEROKU = env.HEROKU

export const KNIGHTLY_BOT_GIST_STORE = env.KNIGHTLY_BOT_GIST_STORE

export const BOT_NAME = 'knightly-bot'
export const VOTE_REQUIREMENT = 10

export const octokit = new Octokit({ auth: GITHUB_TOKEN })
