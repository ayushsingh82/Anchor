import type { WorkflowDefinition } from '../../types'
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
 * Draft workflow: Schedule -> read net flow -> (if negative, i.e. net
 * outflow) -> wrap more of the underlying into the SuperToken to extend
 * the stream's runway.
 *
 * Directly mirrors KeeperHub's own confirmed example ("Net Flow Alert":
 * Schedule (hourly) -> Read Net Flow Rate -> Condition (< 0) -> Discord)
 * from the Superfluid plugin docs — we swap the notify-only last step for
 * an actual top-up, same as the Aave guardian's approach to its own
 * confirmed example.
 *
 * Condition node shape: same unconfirmed piece as the other two protocols.
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
      // TODO(unconfirmed): condition node gating `wrap` on check-flow's
      // net-flow output being negative.
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
      { id: 'e2', source: 'check-flow', target: 'top-up' },
    ],
  }
}
