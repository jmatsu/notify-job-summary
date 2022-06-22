import * as core from '@actions/core'
import {readFileSync} from 'fs'
import {JobOption} from './job'
import {SlackOption} from './slack'
import {GitHubOption} from './github'
import {TemplateOption} from './template'
import {GitHubActionOption} from './github_action'

export interface Inputs {
  jobOption: JobOption
  slackOption: SlackOption
  githubOption: GitHubOption
  templateOption: TemplateOption
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
  const showDefaultTitle = parseBoolean(
    core.getInput('show-default-title', {
      required: false,
      trimWhitespace: true
    })
  )
  const showRunnerMetadata = parseBoolean(
    core.getInput('show-runner-metadata', {
      required: false,
      trimWhitespace: true
    })
  )
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
      return readFileSync(templatePath, 'utf-8')
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

  const jobOption: JobOption = {
    id: ensurePresence(process.env.GITHUB_JOB),
    status: jobStatus,
    runner: showRunnerMetadata
      ? {
          arch: ensurePresence(process.env.RUNNER_ARCH),
          name: ensurePresence(process.env.RUNNER_NAME),
          os: ensurePresence(process.env.RUNNER_OS)
        }
      : undefined
  }

  const slackOption: SlackOption = {
    webhookURL,
    channel: channel || undefined,
    author: author || undefined,
    authorIconEmoji: authorIconEmoji || undefined
  }

  const actionOption: GitHubActionOption = {
    workflowName: ensurePresence(process.env.GITHUB_WORKFLOW),
    eventName: ensurePresence(process.env.GITHUB_EVENT_NAME),
    runId: ensurePresence(process.env.GITHUB_RUN_ID),
    actor: ensurePresence(process.env.GITHUB_ACTOR)
  }

  const event = JSON.parse(
    readFileSync(ensurePresence(process.env.GITHUB_EVENT_PATH), 'utf-8')
  )

  actionOption.actionName = event.action

  switch (actionOption.eventName) {
    case 'pull_request':
    case 'pull_request_target': {
      const pullRequest = event.pull_request

      actionOption.pullNumber = parseInt(pullRequest.number, 10)
      break
    }
    case 'issue_comment': {
      const issue = event.issue

      if (issue.pull_request) {
        actionOption.pullNumber = parseInt(issue.number, 10)
      } else {
        actionOption.pullNumber = parseInt(issue.number, 10)
      }
      break
    }
    case 'workflow_run': {
      actionOption.targetWorkflowName = event.workflow.name
      break
    }
  }

  const githubOption: GitHubOption = {
    repoSlug: ensurePresence(process.env.GITHUB_REPOSITORY),
    ref: ensurePresence(process.env.GITHUB_REF),
    sha: ensurePresence(process.env.GITHUB_SHA),
    action: actionOption
  }

  return {
    jobOption,
    slackOption,
    githubOption,
    templateOption: {
      default: {
        showTitle: showDefaultTitle
      },
      content: contentTemplate,
      options: {
        job: jobOption,
        slack: slackOption,
        github: githubOption
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

const parseBoolean: (v: string | undefined) => boolean = (
  v: string | undefined
) => {
  // https://docs.github.com/en/actions/learn-github-actions/expressions
  if (!v || v === '' || v === '0' || v === 'false') {
    return false
  } else {
    return true
  }
}
