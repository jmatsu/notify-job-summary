import {createPayload} from '../src/payload'
import {expect, test} from '@jest/globals'
import {TemplateOption} from '../src/template'
import {JobOption} from '../src/job'
import {SlackOption} from '../src/slack'
import {GitHubOption} from '../src/github'
import {RunnerOption} from '../src/runner'
import {GitHubActionOption} from '../src/github_action'

const runnerOption: RunnerOption = {
  arch: 'x86',
  name: 'self-host',
  os: 'Linux'
}

const jobOption: JobOption = {
  id: 'job id',
  status: 'success',
  runner: runnerOption
}

const slackOption: SlackOption = {
  webhookURL: 'webhook url',
  channel: 'channel id or name',
  author: 'notifier name',
  authorIconEmoji: ':emoji:'
}

const actionOption: GitHubActionOption = {
  workflowName: 'super cool workflow',
  eventName: 'fake event name',
  runId: 'fake 12345',
  actor: 'fake workflow actor'
}

const githubOption: GitHubOption = {
  repoSlug: 'fake orgName/repoName',
  ref: 'refs/tag/fake',
  sha: 'fake sha',
  action: actionOption
}

const templateOption: TemplateOption = {
  content: undefined,
  options: {
    job: jobOption,
    slack: slackOption,
    github: githubOption
  }
}

// We guess some of users wanna hide these values to open
test('do not expose secrets', async () => {
  const payload = await createPayload(
    jobOption,
    {
      ...slackOption,
      webhookURL: 'do not expose',
      channel: 'do not expose'
    },
    githubOption,
    templateOption
  )

  expect(JSON.stringify(payload.blocks).indexOf('do not expose')).toBeLessThan(
    0
  )
})

test('attributes should match', async () => {
  const payload = await createPayload(
    jobOption,
    slackOption,
    githubOption,
    templateOption
  )

  expect(payload.channel).toEqual('channel id or name')
  expect(payload.username).toEqual('notifier name')
  expect(payload.icon_emoji).toEqual(':emoji:')

  const stringified = JSON.stringify(payload.blocks)

  expect(stringified).toContain(jobOption.id)
  expect(stringified).toContain(actionOption.workflowName)
  expect(stringified).toContain(actionOption.eventName)
  expect(stringified).toContain(
    'https://github.com/fake orgName/repoName/actions/runs/fake 12345'
  )
  expect(stringified).toContain(githubOption.repoSlug)
  expect(stringified).toContain(actionOption.actor)
  expect(stringified).toContain(githubOption.ref)
  expect(stringified).toContain(githubOption.sha)

  expect(stringified).toContain(runnerOption.arch)
  expect(stringified).toContain(runnerOption.os)
  expect(stringified).toContain(runnerOption.name)
})

test('make sure job status is correctly reflected', async () => {
  expect(
    JSON.stringify(
      await createPayload(
        {
          ...jobOption,
          status: 'success'
        },
        slackOption,
        githubOption,
        templateOption
      )
    )
  ).toContain('success')
  expect(
    JSON.stringify(
      await createPayload(
        {
          ...jobOption,
          status: 'failure'
        },
        slackOption,
        githubOption,
        templateOption
      )
    )
  ).toContain('failure')
  expect(
    JSON.stringify(
      await createPayload(
        {
          ...jobOption,
          status: 'cancelled'
        },
        slackOption,
        githubOption,
        templateOption
      )
    )
  ).toContain('cancelled')
})

test('attributes should match', async () => {
  const payload = await createPayload(
    jobOption,
    slackOption,
    githubOption,
    templateOption
  )

  expect(payload.channel).toEqual('channel id or name')
  expect(payload.username).toEqual('notifier name')
  expect(payload.icon_emoji).toEqual(':emoji:')

  const stringified = JSON.stringify(payload.blocks)

  expect(stringified).toContain(jobOption.id)
  expect(stringified).toContain(actionOption.workflowName)
  expect(stringified).toContain(actionOption.eventName)
  expect(stringified).toContain(
    'https://github.com/fake orgName/repoName/actions/runs/fake 12345'
  )
  expect(stringified).toContain(githubOption.repoSlug)
  expect(stringified).toContain(actionOption.actor)
  expect(stringified).toContain(githubOption.ref)
  expect(stringified).toContain(githubOption.sha)
})

test('make sure template has rendered', async () => {
  expect(
    JSON.stringify(
      await createPayload(
        {
          ...jobOption,
          status: 'success'
        },
        slackOption,
        githubOption,
        {
          ...templateOption,
          content: 'rendered <%= job.id %>'
        }
      )
    )
  ).toContain(`rendered ${jobOption.id}`)
})
