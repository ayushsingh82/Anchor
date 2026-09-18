/**
 * Workflow node/edge shapes, per docs.keeperhub.com/workflows/schema-reference,
 * plus the Condition node shape and template-reference syntax below —
 * confirmed by reading KeeperHub's own open-source repo directly
 * (lib/workflow/nodes/condition/{builder-types,resolver,expression}.ts),
 * since both 404'd when checked against the public docs.
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

/**
 * Reference to a prior node's output field: `{{@nodeId:Label.field}}`.
 * `label` must match the referenced node's `data.label` exactly, or the
 * resolver falls back to splitting on the first dot (see splitTemplateRef
 * in their repo) — safest to always match the label used in that node.
 */
export function templateRef(nodeId: string, label: string, field: string): string {
  return field ? `{{@${nodeId}:${label}.${field}}}` : `{{@${nodeId}:${label}}}`
}

export type ConditionOperator =
  | '=='
  | '==='
  | '!='
  | '!=='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'exists'
  | 'doesNotExist'
  | 'isNull'
  | 'isNotNull'
  | 'isUndefined'
  | 'isNotUndefined'
  | 'matchesRegex'
  | 'isTrue'
  | 'isFalse'
  | 'arrayIsEmpty'
  | 'arrayIsNotEmpty'
  | 'arrayContains'
  | 'arrayLength'
  | 'objectIsEmpty'
  | 'objectHasKey'

export interface ConditionRule {
  id: string
  leftOperand: string
  operator: ConditionOperator
  /** Unused by unary operators (isTrue, exists, isEmpty, ...) — pass ''. */
  rightOperand: string
}

export interface ConditionGroup {
  id: string
  logic: 'AND' | 'OR'
  rules: Array<ConditionRule | ConditionGroup>
}

/** A Condition node's `data.config` shape. Nesting under `conditionConfig`
 * matters — a top-level `{ group }` is silently ignored by the resolver
 * (this is the real KeeperHub bug we're filing a bounty PR against). */
export interface ConditionNodeConfig {
  conditionConfig: {
    group: ConditionGroup
  }
}

let ruleCounter = 0
/** Deterministic-enough IDs for a single workflow build (not persisted/compared across runs). */
function nextId(prefix: string): string {
  ruleCounter += 1
  return `${prefix}-${ruleCounter}`
}

/** Build a single-rule Condition node's config. Most of our guardian
 * workflows only ever need one rule gating the branch. */
export function singleRuleCondition(rule: Omit<ConditionRule, 'id'>): ConditionNodeConfig {
  return {
    conditionConfig: {
      group: {
        id: nextId('group'),
        logic: 'AND',
        rules: [{ id: nextId('rule'), ...rule }],
      },
    },
  }
}
