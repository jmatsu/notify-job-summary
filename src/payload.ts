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

const githubOptionElements = (option: GitHubOption): MarkdownBlock[] => {
  return [
    {
      type: 'mrkdwn',
      text: `*event* : ${option.action.eventName}`
    },
    {
      type: 'mrkdwn',
      text: `*actor* ${option.action.actor}`
    },
    {
      type: 'mrkdwn',
      text: `*ref* ${option.ref}`
    },
    {
      type: 'mrkdwn',
      text: `*sha* ${option.sha}`
    }
  ]
}

const jobOptionElements = (option: JobOption): MarkdownBlock[] => {
  return [
    {
      type: 'mrkdwn',
      text: `*job_id* ${option.id}`
    },
    {
      type: 'mrkdwn',
      text: `*arch* ${option.runner.arch}`
    },
    {
      type: 'mrkdwn',
      text: `*os* ${option.runner.os}`
    },
    {
      type: 'mrkdwn',
      text: `*runner_name* ${option.runner.name}`
    }
  ]
}
