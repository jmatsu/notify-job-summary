import * as ejs from 'ejs'
import {JobOption} from './job'
import {SlackOption} from './slack'
import {GitHubOption} from './github'
import {TemplateOption} from './template'

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
    ? await ejs.render(`\n${templateOption.content}`, templateOption.options, {
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
          `*You can check the details from https://github.com/${githubOption.repoSlug}/actions/runs/${githubOption.action.runId} *${additionalContent}`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [...githubOptionElements(githubOption)]
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [...jobOptionElements(jobOption)]
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

const githubOptionElements = (option: GitHubOption): MarkdownBlock[] => {
  const blocks: MarkdownBlock[] = []

  if (option.action.pullNumber) {
    blocks.push(contextPart('pull-number', option.action.pullNumber))
  }

  if (option.action.issueNumber) {
    blocks.push(contextPart('issue-number', option.action.issueNumber))
  }

  if (option.action.actionName) {
    blocks.push(contextPart('action-name', option.action.actionName))
  }

  if (option.action.targetWorkflowName) {
    blocks.push(
      contextPart('target-workflow-name', option.action.targetWorkflowName)
    )
  }

  return [
    contextPart('event', option.action.eventName),
    contextPart('actor', option.action.actor),
    contextPart('ref', option.ref),
    contextPart('sha', option.sha),
    ...blocks
  ]
}

const jobOptionElements = (option: JobOption): MarkdownBlock[] => {
  return [
    contextPart('job_id', option.id),
    contextPart('arch', option.runner.arch),
    contextPart('os', option.runner.os),
    contextPart('runner-name', option.runner.name)
  ]
}
