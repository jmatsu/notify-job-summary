export interface GitHubOption {
  workflowName: string
  eventName: string
  runId: string
  repoSlug: string
  actor: string
  ref: string
  sha: string
}
