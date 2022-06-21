import {GitHubOption, JobOption, SlackOption} from './inputs'

export interface Payload {
  channel?: string
  username?: string
  icon_emoji?: string
  blocks: unknown[]
}

export const createPayload: (
  jobOption: JobOption,
  slackOption: SlackOption,
  githubOption: GitHubOption
) => Payload = (jobOption, slackOption, githubOption) => {
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

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${jobStatusEmoji} GitHub Actions workflow *${githubOption.workflowName}* in ${githubOption.repoSlug} has been *${jobOption.status}*. \n\n *You can check the details from https://github.com/${githubOption.repoSlug}/actions/runs/${githubOption.runId} *`
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
          text: `*event* : ${githubOption.eventName}`
        },
        {
          type: 'mrkdwn',
          text: `*actor* ${githubOption.actor}`
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
