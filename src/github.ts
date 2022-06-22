import {GitHubActionOption} from './github_action'

export interface GitHubOption {
  repoSlug: string
  ref: string
  sha: string
  action: GitHubActionOption
}
