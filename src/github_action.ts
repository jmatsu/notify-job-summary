export interface GitHubActionOption {
  workflowName: string
  eventName: string
  runId: string
  actor: string
  actionName?: string
  pullNumber?: number
  issueNumber?: number
  incomingWorkflowName?: string
}
