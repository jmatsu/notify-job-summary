import {JobOption} from './job'
import {GitHubOption} from './github'
import {SlackOption} from './slack'

export interface EjsOption {
  job: JobOption
  github: GitHubOption
  slack: SlackOption
}

export interface DefaultOption {
  showTitle: boolean
}

export interface TemplateOption {
  default: DefaultOption
  content?: string
  options: EjsOption
}
