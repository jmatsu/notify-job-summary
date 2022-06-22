import * as core from '@actions/core'
import {readFileSync} from 'fs'
import {JobOption} from './job'
import {SlackOption} from './slack'
import {GitHubOption} from './github'
import {TemplateOption} from './template'
import {RunnerOption} from './runner'

export interface Inputs {
  jobOption: JobOption
  slackOption: SlackOption
  githubOption: GitHubOption
  templateOption: TemplateOption
  runnerOption: RunnerOption
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
  const contentTemplate: string | undefined = ((template, templatePath) => {
    if (template && templatePath) {
      throw new Error(
        'Either one of content-template and content-template-path can be specified'
      )
    }

    if (templatePath) {
      return readFileSync(templatePath).toString()
    } else if (template) {
      return template
    } else {
      return undefined
    }
  })(
    core.getInput('content-template', {
      required: false,
      trimWhitespace: false
    }),
    core.getInput('content-template-path', {
      required: false,
      trimWhitespace: false
    })
  )

  const jobOption = {
    id: ensurePresence(process.env.GITHUB_JOB),
    status: jobStatus
  }

  const slackOption = {
    webhookURL,
    channel: channel || undefined,
    author: author || undefined,
    authorIconEmoji: authorIconEmoji || undefined
  }

  const githubOption = {
    workflowName: ensurePresence(process.env.GITHUB_WORKFLOW),
    eventName: ensurePresence(process.env.GITHUB_EVENT_NAME),
    runId: ensurePresence(process.env.GITHUB_RUN_ID),
    repoSlug: ensurePresence(process.env.GITHUB_REPOSITORY),
    actor: ensurePresence(process.env.GITHUB_ACTOR),
    ref: ensurePresence(process.env.GITHUB_REF),
    sha: ensurePresence(process.env.GITHUB_REF)
  }

  const runnerOption = {
    arch: ensurePresence(process.env.RUNNER_ARCH),
    name: ensurePresence(process.env.RUNNER_NAME),
    os: ensurePresence(process.env.RUNNER_OS)
  }

  return {
    jobOption,
    slackOption,
    githubOption,
    runnerOption,
    templateOption: {
      content: contentTemplate,
      options: {
        jobOption,
        slackOption,
        githubOption,
        runnerOption
      }
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
