import {JobOption} from './job'
import {GitHubOption} from './github'
import {SlackOption} from './slack'
import {RunnerOption} from './runner'
import {GitHubActionOption} from './github_action'

export interface EjsOption {
  jobOption: JobOption
  githubOption: GitHubOption
  actionOption: GitHubActionOption
  slackOption: SlackOption
  runnerOption: RunnerOption
}

export interface TemplateOption {
  content?: string
  options: EjsOption
}
