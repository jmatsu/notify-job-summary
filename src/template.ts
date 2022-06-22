import {JobOption} from './job'
import {GitHubOption} from './github'
import {SlackOption} from './slack'

export interface EjsOption {
  jobOption: JobOption
  githubOption: GitHubOption
  slackOption: SlackOption
}

export interface TemplateOption {
  content?: string
  options: EjsOption
}
