import * as ejs from 'ejs'
import {JobOption} from './job'
import {SlackOption} from './slack'
import {GitHubOption} from './github'
import {TemplateOption} from './template'
import {RunnerOption} from './runner'
import {GitHubActionOption} from './github_action'

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
  actionOption: GitHubActionOption,
  runnerOption: RunnerOption,
  templateOption: TemplateOption
) => Promise<Payload> = async (
  jobOption,
  slackOption,
  githubOption,
  actionOption,
  runnerOption,
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
          `${jobStatusEmoji} GitHub Actions workflow *${actionOption.workflowName}* in *${githubOption.repoSlug}* has been *${jobOption.status}*.\n\n` +
          `*You can check the details from https://github.com/${githubOption.repoSlug}/actions/runs/${actionOption.runId} *${additionalContent}`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*event* : ${actionOption.eventName}`
        },
        {
          type: 'mrkdwn',
          text: `*actor* ${actionOption.actor}`
        },
        {
          type: 'mrkdwn',
          text: `*ref* ${githubOption.ref}`
        },
        {
          type: 'mrkdwn',
          text: `*sha* ${githubOption.sha}`
        },
        {
          type: 'mrkdwn',
          text: `*job_id* ${jobOption.id}`
        },
        {
          type: 'mrkdwn',
          text: `*arch* ${runnerOption.arch}`
        },
        {
          type: 'mrkdwn',
          text: `*os* ${runnerOption.os}`
        },
        {
          type: 'mrkdwn',
          text: `*runner_name* ${runnerOption.name}`
        }
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
