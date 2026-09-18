import { singleRuleCondition, templateRef, type WorkflowDefinition } from '../../types'
import { SUPERFLUID_PLUGIN_ID, SuperfluidAction } from './actions'

export interface SuperfluidGuardianConfig {
  /** Address whose outgoing stream(s) are being kept alive. */
  account: string
  /** SuperToken being streamed (e.g. a DAIx/USDCx address). */
  token: string
  /** Amount of the underlying to wrap each time the balance runs low. */
  topUpAmount: string
  scheduleCron: string
}

/**
 * Schedule -> read net flow -> (condition: negative, i.e. net outflow) ->
 * wrap more of the underlying to extend the stream's runway.
 *
 * Mirrors KeeperHub's own confirmed example ("Net Flow Alert": Schedule
 * (hourly) -> Read Net Flow Rate -> Condition (< 0) -> Discord) from the
 * Superfluid plugin docs, swapping the notify-only last step for an actual
 * top-up.
 *
 * Condition node config confirmed against KeeperHub's own repo source
 * (see the Pendle workflow for the full note).
 */
export function buildSuperfluidGuardianWorkflow(config: SuperfluidGuardianConfig): WorkflowDefinition {
  return {
    name: 'Superfluid stream guardian',
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        data: {
          label: 'Schedule',
          type: 'trigger',
          config: { triggerType: 'Schedule', cron: config.scheduleCron },
        },
      },
      {
        id: 'check-flow',
        type: 'action',
        data: {
          label: 'Read Net Flow Rate of an Address',
          type: 'action',
          config: {
            pluginId: SUPERFLUID_PLUGIN_ID,
            actionId: SuperfluidAction.getNetFlow,
            account: config.account,
          },
        },
      },
      {
        id: 'gate-outflow',
        type: 'action',
        data: {
          label: 'Only if net outflow',
          type: 'action',
          config: singleRuleCondition({
            leftOperand: templateRef('check-flow', 'Read Net Flow Rate of an Address', 'netFlowRate'),
            operator: '<',
            rightOperand: '0',
          }) as unknown as Record<string, unknown>,
        },
      },
      {
        id: 'top-up',
        type: 'action',
        data: {
          label: 'Wrap to SuperToken',
          type: 'action',
          config: {
            pluginId: SUPERFLUID_PLUGIN_ID,
            actionId: SuperfluidAction.wrap,
            token: config.token,
            amount: config.topUpAmount,
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-flow' },
      { id: 'e2', source: 'check-flow', target: 'gate-outflow' },
      { id: 'e3', source: 'gate-outflow', target: 'top-up' },
    ],
  }
}
