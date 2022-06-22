import {JobOption} from './job'
import {GitHubOption} from './github'
import {SlackOption} from './slack'
import {RunnerOption} from './runner'

export interface EjsOption {
  jobOption: JobOption
  githubOption: GitHubOption
  slackOption: SlackOption
  runnerOption: RunnerOption
}

export interface TemplateOption {
  content?: string
  options: EjsOption
}
