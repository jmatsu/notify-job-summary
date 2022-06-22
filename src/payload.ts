import * as ejs from 'ejs'
import {JobOption} from './job'
import {SlackOption} from './slack'
import {GitHubOption} from './github'
import {TemplateOption} from './template'
import {RunnerOption} from './runner'

export interface Payload {
  channel?: string
  username?: string
  icon_emoji?: string
  blocks: unknown[]
}

export const createPayload: (
  jobOption: JobOption,
  slackOption: SlackOption,
  githubOption: GitHubOption,
  templateOption: TemplateOption
) => Promise<Payload> = async (
  jobOption,
  slackOption,
  githubOption,
  templateOption
) => {
  let jobStatusEmoji = ''

  switch (jobOption.status) {
    case 'success': {
      jobStatusEmoji = ':white_check_mark:'
      break
    }
    case 'failure': {
      jobStatusEmoji = ':no_entry_sign:'
      break
    }
    case 'cancelled': {
      jobStatusEmoji = ':warning:'
      break
    }
    default: {
      // no-op
      break
    }
  }

  const additionalContent = templateOption.content
    ? await ejs.render(`${templateOption.content}`, templateOption.options, {
        async: true
      })
    : ''

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `${jobStatusEmoji} GitHub Actions workflow *${githubOption.action.workflowName}* in *${githubOption.repoSlug}* has been *${jobOption.status}*.\n\n` +
          `*${additionalContent}`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: jobContextParts(jobOption, githubOption)
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: actionContextParts(githubOption)
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: buildContextParts(githubOption, jobOption.runner)
    }
  ]

  return {
    channel: slackOption.channel,
    username: slackOption.author,
    icon_emoji: slackOption.authorIconEmoji,
    blocks
  }
}

interface MarkdownBlock {
  type: 'mrkdwn'
  text: string
}

const contextPart: (key: string, value: unknown) => MarkdownBlock = (
  key,
  value
) => ({
  type: 'mrkdwn',
  text: `*${key}* : ${value}`
})

const jobContextParts = (
  job: JobOption,
  github: GitHubOption
): MarkdownBlock[] => {
  return [
    contextPart('job-id', job.id),
    contextPart(
      'run-url',
      `https://github.com/${github.repoSlug}/actions/runs/${github.action.runId}`
    )
  ]
}

const actionContextParts = (github: GitHubOption): MarkdownBlock[] => {
  const blocks: MarkdownBlock[] = []

  if (github.action.actionName) {
    blocks.push(contextPart('action-name', github.action.actionName))
  }

  if (github.action.pullNumber) {
    blocks.push(contextPart('pull-number', github.action.pullNumber))
  }

  if (github.action.issueNumber) {
    blocks.push(contextPart('issue-number', github.action.issueNumber))
  }

  if (github.action.targetWorkflowName) {
    blocks.push(
      contextPart('target-workflow-name', github.action.targetWorkflowName)
    )
  }

  return [
    contextPart('actor', github.action.actor),
    contextPart('event', github.action.eventName),
    ...blocks
  ]
}

const buildContextParts = (
  github: GitHubOption,
  runner: RunnerOption
): MarkdownBlock[] => {
  return [
    contextPart('ref', github.ref),
    contextPart('sha', github.sha),
    contextPart('arch', runner.arch),
    contextPart('os', runner.os),
    contextPart('runner-name', runner.name)
  ]
}
