import * as core from '@actions/core'

export interface SlackOption {
  webhookURL: string
  channel?: string
  author?: string
  authorIconEmoji?: string
}

export interface GitHubOption {
  workflowName: string
  eventName: string
  runId: string
  repoSlug: string
  actor: string
  ref: string
  sha: string
}

export interface JobOption {
  id: string
  status: string
}

export interface Inputs {
  jobOption: JobOption
  slackOption: SlackOption
  githubOption: GitHubOption
}

export const parseInputs: () => Inputs = () => {
  const webhookURL = core.getInput('webhook-url', {
    required: true,
    trimWhitespace: true
  })
  const channel = core.getInput('channel', {
    required: false,
    trimWhitespace: true
  })
  const author = core.getInput('author', {
    required: false,
    trimWhitespace: true
  })
  const authorIconEmoji = core.getInput('author-icon-emoji', {
    required: false,
    trimWhitespace: true
  })
  const jobStatus = core.getInput('job-status', {
    required: true,
    trimWhitespace: true
  })

  return {
    jobOption: {
      id: ensurePresence(process.env.GITHUB_JOB),
      status: jobStatus
    },
    slackOption: {
      webhookURL,
      channel: channel || undefined,
      author: author || undefined,
      authorIconEmoji: authorIconEmoji || undefined
    },
    githubOption: {
      workflowName: ensurePresence(process.env.GITHUB_WORKFLOW),
      eventName: ensurePresence(process.env.GITHUB_EVENT_NAME),
      runId: ensurePresence(process.env.GITHUB_RUN_ID),
      repoSlug: ensurePresence(process.env.GITHUB_REPOSITORY),
      actor: ensurePresence(process.env.GITHUB_ACTOR),
      ref: ensurePresence(process.env.GITHUB_REF),
      sha: ensurePresence(process.env.GITHUB_REF)
    }
  }
}

const ensurePresence: (v: string | undefined) => string = (
  v: string | undefined
) => {
  if (!v) {
    throw new Error('unexpected non-presence value is detected')
  }

  return v
}
