import {createPayload} from '../src/payload'
import {expect, test} from '@jest/globals'
import {JobOption, GitHubOption, SlackOption} from '../src/inputs'

const jobOption: JobOption = {
  id: 'job id',
  status: 'success'
}

const slackOption: SlackOption = {
  webhookURL: 'webhook url',
  channel: 'channel id or name',
  author: 'notifier name',
  authorIconEmoji: ':emoji:'
}

const gitHubOption: GitHubOption = {
  workflowName: 'super cool workflow',
  eventName: 'fake event name',
  runId: 'fake 12345',
  repoSlug: 'fake orgName/repoName',
  actor: 'fake workflow actor',
  ref: 'refs/tag/fake',
  sha: 'fake sha'
}

// We guess some of users wanna hide these values to open
test('do not expose secrets', async () => {
  const payload = createPayload(
    jobOption,
    {
      ...slackOption,
      webhookURL: 'do not expose',
      channel: 'do not expose'
    },
    gitHubOption
  )

  expect(JSON.stringify(payload.blocks).indexOf('do not expose')).toBeLessThan(
    0
  )
})

test('attributes should match', async () => {
  const payload = createPayload(jobOption, slackOption, gitHubOption)

  expect(payload.channel).toEqual('channel id or name')
  expect(payload.username).toEqual('notifier name')
  expect(payload.icon_emoji).toEqual(':emoji:')

  const stringified = JSON.stringify(payload.blocks)

  expect(stringified).toContain(jobOption.id)
  expect(stringified).toContain(gitHubOption.workflowName)
  expect(stringified).toContain(gitHubOption.eventName)
  expect(stringified).toContain(
    'https://github.com/fake orgName/repoName/actions/runs/fake 12345'
  )
  expect(stringified).toContain(gitHubOption.repoSlug)
  expect(stringified).toContain(gitHubOption.actor)
  expect(stringified).toContain(gitHubOption.ref)
  expect(stringified).toContain(gitHubOption.sha)
})

test('make sure job status is correctly reflected', async () => {
  expect(
    JSON.stringify(
      createPayload(
        {
          ...jobOption,
          status: 'success'
        },
        slackOption,
        gitHubOption
      )
    )
  ).toContain('success')
  expect(
    JSON.stringify(
      createPayload(
        {
          ...jobOption,
          status: 'failure'
        },
        slackOption,
        gitHubOption
      )
    )
  ).toContain('failure')
  expect(
    JSON.stringify(
      createPayload(
        {
          ...jobOption,
          status: 'cancelled'
        },
        slackOption,
        gitHubOption
      )
    )
  ).toContain('cancelled')
})
