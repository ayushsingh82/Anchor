/**
 * Workflow node/edge shapes, per docs.keeperhub.com/workflows/schema-reference.
 *
 * NOT YET CONFIRMED from docs: the exact JSON shape for a Condition/branch
 * node, and the exact output-reference template syntax (e.g. whether it's
 * `{{nodeId.field}}` or something else). Both 404'd when checked directly.
 * Plan: draft the condition node via KeeperHub's own AI canvas prompt (a
 * documented feature — describe it in plain English, review what it
 * assembles), then use the documented Import/Export feature to pull the
 * real JSON instead of guessing it here.
 */

export type TriggerType = 'Manual' | 'Schedule' | 'Webhook' | 'Event' | 'Block' | 'Transfer'

export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action'
  data: {
    label: string
    type: 'trigger' | 'action'
    config: Record<string, unknown>
    status?: string
    description?: string
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
}

export interface WorkflowDefinition {
  name: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface ScheduleTriggerConfig {
  triggerType: 'Schedule'
  /** Cron-style interval — exact field name unconfirmed; matches the
   * "every 5 minutes" cron example shown in KeeperHub's own front-page demo. */
  cron: string
}
