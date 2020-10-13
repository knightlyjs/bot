import { Octokit } from '@octokit/rest'
import dotenv from 'dotenv'

const { parsed: env = {} } = dotenv.config({})

/**
 * GitHub handles for admin,
 *
 * when one of the admin vote on the build request,
 * the request will be accepted regardless of the vote count
 */
export const ADMIN_HANDLES = [
  'antfu',
]

export const GITHUB_TOKEN: string = env.GITHUB_TOKEN! || process.env.GITHUB_TOKEN!
export const BOT_NAME = 'knightly-bot'
export const VOTE_REQUIREMENT = 10

export const octokit = new Octokit({ auth: GITHUB_TOKEN })
