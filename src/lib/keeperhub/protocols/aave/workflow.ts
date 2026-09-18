import { singleRuleCondition, templateRef, type WorkflowDefinition } from '../../types'
import { AAVE_V3_PLUGIN_ID, AaveAction, MAX_UINT256 } from './actions'

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
 * Schedule -> read health factor -> (condition: below floor) -> repay.
 * Mirrors KeeperHub's own confirmed example ("Health Factor Monitor with
 * Alert": Schedule -> Get User Account Data -> Code -> Condition -> Discord)
 * from docs.keeperhub.com/plugins/aave-v3 — swapping the notify-only last
 * step for a real repay, since the goal is prevention, not just an alert.
 *
 * Condition node config confirmed against KeeperHub's own repo source
 * (see the Pendle workflow for the full note).
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
      {
        id: 'gate-unhealthy',
        type: 'action',
        data: {
          label: 'Only if below floor',
          type: 'action',
          config: singleRuleCondition({
            leftOperand: templateRef('check-health', 'Get User Account Data', 'healthFactor'),
            operator: '<',
            rightOperand: config.healthFactorFloor,
          }) as unknown as Record<string, unknown>,
        },
      },
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
            // MAX_UINT256 means "repay the entire debt" — confirmed against
            // docs.keeperhub.com/plugins/aave-v3, and the right amount for a
            // guardian anyway (see actions.ts for why a partial repay isn't
            // safer here).
            interestRateMode: '2',
            amount: MAX_UINT256,
            onBehalfOf: config.user,
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-health' },
      { id: 'e2', source: 'check-health', target: 'gate-unhealthy' },
      { id: 'e3', source: 'gate-unhealthy', target: 'repay' },
    ],
  }
}
