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
  const metadata = [
    contextPart('workflow-name', githubOption.action.workflowName)
  ]

  const sectionText = []

  if (templateOption.default.showTitle) {
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

    sectionText.push(
      `${jobStatusEmoji} Job *${jobOption.id}* in *${githubOption.repoSlug}* has been *${jobOption.status}*.`
    )
    sectionText.push('\n')
    sectionText.push(
      `You can check the details from https://github.com/${githubOption.repoSlug}/actions/runs/${githubOption.action.runId}`
    )
  } else {
    metadata.push(...alternativeTitleContextParts(jobOption, githubOption))
  }

  if (templateOption.content) {
    sectionText.push(
      await ejs.render(`${templateOption.content}`, templateOption.options, {
        async: true
      })
    )
  }

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: sectionText.join('\n')
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        ...metadata,
        ...actionContextParts(githubOption),
        ...buildContextParts(githubOption, jobOption.runner)
      ]
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

const alternativeTitleContextParts = (
  job: JobOption,
  github: GitHubOption
): MarkdownBlock[] => {
  return [
    contextPart('repo', github.repoSlug),
    contextPart('job-id', job.id),
    contextPart('job-status', job.status),
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
  runner?: RunnerOption
): MarkdownBlock[] => {
  const blocks = []

  if (runner) {
    blocks.push(contextPart('arch', runner.arch))
    blocks.push(contextPart('os', runner.os))
    blocks.push(contextPart('runner-name', runner.name))
  }

  return [
    contextPart('ref', github.ref),
    contextPart('sha', github.sha),
    ...blocks
  ]
}
