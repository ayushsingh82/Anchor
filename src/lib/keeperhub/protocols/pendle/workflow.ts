import { singleRuleCondition, templateRef, type WorkflowDefinition } from '../../types'
import { PENDLE_PLUGIN_ID, PendleAction } from './actions'

export interface PendleRolloverConfig {
  /** Wallet whose PT position is being rolled. */
  receiver: string
  /** YT contract address of the expiring market (source of the redeem). */
  oldYT: string
  /** YT contract address of the next market to roll into. */
  newYT: string
  scheduleCron: string
}

/**
 * Schedule -> check expiry -> (condition: expired) -> redeem old PT/YT to
 * SY -> mint new PT/YT from that SY.
 *
 * Condition node config and the `{{@nodeId:Label.field}}` template syntax
 * are both confirmed by reading KeeperHub's own repo directly
 * (lib/workflow/nodes/condition/{builder-types,resolver}.ts) — both 404'd
 * against the public docs, so this was verified against the real source
 * rather than guessed.
 */
export function buildPendleRolloverWorkflow(config: PendleRolloverConfig): WorkflowDefinition {
  return {
    name: 'Pendle PT auto-rollover',
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
        id: 'check-expired',
        type: 'action',
        data: {
          label: 'Is PT Expired',
          type: 'action',
          config: { pluginId: PENDLE_PLUGIN_ID, actionId: PendleAction.isPtExpired },
        },
      },
      {
        id: 'gate-expired',
        type: 'action',
        data: {
          label: 'Only if expired',
          type: 'action',
          config: singleRuleCondition({
            leftOperand: templateRef('check-expired', 'Is PT Expired', 'expired'),
            operator: 'isTrue',
            rightOperand: '',
          }) as unknown as Record<string, unknown>,
        },
      },
      {
        id: 'pt-balance',
        type: 'action',
        data: {
          label: 'Get PT Balance',
          type: 'action',
          config: {
            pluginId: PENDLE_PLUGIN_ID,
            actionId: PendleAction.getPtBalance,
            account: config.receiver,
          },
        },
      },
      {
        id: 'redeem',
        type: 'action',
        data: {
          label: 'Redeem PT and YT to SY',
          type: 'action',
          config: {
            pluginId: PENDLE_PLUGIN_ID,
            actionId: PendleAction.redeemPtYtToSy,
            receiver: config.receiver,
            YT: config.oldYT,
            // netPyIn: the full PT balance just read, via the confirmed
            // `{{@nodeId:Label.field}}` reference syntax — "redeem
            // everything" rather than a fixed amount.
            netPyIn: templateRef('pt-balance', 'Get PT Balance', 'balance'),
            // minSyOut: '0' is a deliberate choice, not a guess — this is a
            // direct PT/YT->SY redemption inside Pendle itself (no DEX
            // routing/slippage to bound), and it only fires post-maturity
            // when the exchange rate is fixed at 1 PT = 1 SY-equivalent.
            minSyOut: '0',
          },
        },
      },
      {
        id: 'sy-balance',
        type: 'action',
        data: {
          label: 'Get SY Balance',
          type: 'action',
          config: {
            pluginId: PENDLE_PLUGIN_ID,
            actionId: PendleAction.getSyBalance,
            account: config.receiver,
          },
        },
      },
      {
        id: 'mint-new',
        type: 'action',
        data: {
          label: 'Mint PT and YT from SY',
          type: 'action',
          config: {
            pluginId: PENDLE_PLUGIN_ID,
            actionId: PendleAction.mintPtYtFromSy,
            receiver: config.receiver,
            YT: config.newYT,
            // netSyIn: the SY balance produced by the redeem above, read
            // fresh rather than assumed — same reasoning as netPyIn.
            netSyIn: templateRef('sy-balance', 'Get SY Balance', 'balance'),
            // minPyOut: '0', same rationale as minSyOut above; this market
            // hasn't matured yet so there's no fixed exchange rate to bound
            // against without an extra price-impact estimate this
            // workflow doesn't compute.
            minPyOut: '0',
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-expired' },
      { id: 'e2', source: 'check-expired', target: 'gate-expired' },
      { id: 'e3', source: 'gate-expired', target: 'pt-balance' },
      { id: 'e4', source: 'pt-balance', target: 'redeem' },
      { id: 'e5', source: 'redeem', target: 'sy-balance' },
      { id: 'e6', source: 'sy-balance', target: 'mint-new' },
    ],
  }
}
