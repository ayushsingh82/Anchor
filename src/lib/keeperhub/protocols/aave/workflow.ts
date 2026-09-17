import type { WorkflowDefinition } from '../../types'
import { AAVE_V3_PLUGIN_ID, AaveAction } from './actions'

export interface AaveGuardianConfig {
  /** Wallet whose Aave V3 position is being protected. */
  user: string
  /** Asset repaid to bring the health factor back up. */
  repayAsset: string
  scheduleCron: string
  /** Health factor floor, 18-decimals string per Aave's own units (e.g. "1500000000000000000" = 1.5). */
  healthFactorFloor: string
}

/**
 * Draft workflow: Schedule -> read health factor -> (if below floor) repay.
 * Mirrors KeeperHub's own confirmed example ("Health Factor Monitor with
 * Alert": Schedule -> Get User Account Data -> Code -> Condition -> Discord)
 * from docs.keeperhub.com/plugins/aave-v3 — we swap the final notify-only
 * step for a real repay, since the goal is prevention, not just an alert.
 *
 * Condition node shape is the same unconfirmed piece flagged in the Pendle
 * workflow — same plan: draft it via KeeperHub's AI canvas, then reconcile.
 */
export function buildAaveGuardianWorkflow(config: AaveGuardianConfig): WorkflowDefinition {
  return {
    name: 'Aave health-factor guardian',
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
        id: 'check-health',
        type: 'action',
        data: {
          label: 'Get User Account Data',
          type: 'action',
          config: {
            pluginId: AAVE_V3_PLUGIN_ID,
            actionId: AaveAction.getUserAccountData,
            user: config.user,
          },
        },
      },
      // TODO(unconfirmed): condition node gating `repay` on
      // check-health's `healthFactor` output falling below
      // config.healthFactorFloor.
      {
        id: 'repay',
        type: 'action',
        data: {
          label: 'Repay Debt',
          type: 'action',
          config: {
            pluginId: AAVE_V3_PLUGIN_ID,
            actionId: AaveAction.repay,
            asset: config.repayAsset,
            // interestRateMode/amount: unconfirmed how to reference "repay
            // just enough to clear the floor" — likely needs a Math node
            // computing the shortfall from check-health's output, once the
            // reference/template syntax is confirmed (see PLAN.md).
            interestRateMode: '2',
            amount: '0',
            onBehalfOf: config.user,
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-health' },
      { id: 'e2', source: 'check-health', target: 'repay' },
    ],
  }
}
