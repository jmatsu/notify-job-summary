/*eslint sort-imports: ["error", { "ignoreDeclarationSort": true }]*/
import * as core from '@actions/core'
import {HttpClient} from '@actions/http-client'
import {parseInputs} from './inputs'
import {createPayload} from './payload'

async function run(): Promise<void> {
  try {
    const {jobOption, slackOption, githubOption} = parseInputs()

    const payload = createPayload(jobOption, slackOption, githubOption)

    const client = new HttpClient('notify-job-summary')

    const response = await client.post(
      slackOption.webhookURL,
      JSON.stringify(payload)
    )
    const responseBody = await response.readBody()

    core.setOutput('payload', payload)
    core.setOutput('response', responseBody)
    core.setOutput('status-code', response.message.statusCode)
    core.setOutput('ok', responseBody === 'ok')
  } catch (error) {
    core.setOutput('ok', false)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
