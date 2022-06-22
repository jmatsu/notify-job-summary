import {JobOption} from './job'
import {GitHubOption} from './github'
import {SlackOption} from './slack'

export interface EjsOption {
  job: JobOption
  github: GitHubOption
  slack: SlackOption
}

export interface TemplateOption {
  content?: string
  options: EjsOption
}
