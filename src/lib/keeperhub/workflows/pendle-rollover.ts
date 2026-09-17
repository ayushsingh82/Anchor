import type { WorkflowDefinition } from '../types'
import { PENDLE_PLUGIN_ID, PendleAction } from '../pendle'

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
 * Draft workflow: Schedule -> check expiry -> (if expired) redeem old PT/YT
 * to SY -> mint new PT/YT from that SY -> notify.
 *
 * The condition node between "check expiry" and "redeem" is a placeholder
 * (`type: 'condition'`, unconfirmed shape — see src/lib/keeperhub/types.ts).
 * Treat this file as a draft to reconcile against the real JSON once it's
 * been built once in KeeperHub's own AI canvas and exported.
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
      // TODO(unconfirmed): condition node gating the next two steps on
      // check-expired's `expired` output being true.
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
            // netPyIn / minSyOut: unconfirmed how to reference "redeem full
            // balance" — likely needs a preceding get-pt-balance read fed in
            // via template syntax once that syntax is confirmed.
            netPyIn: '0',
            minSyOut: '0',
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
            netSyIn: '0',
            minPyOut: '0',
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-expired' },
      { id: 'e2', source: 'check-expired', target: 'redeem' },
      { id: 'e3', source: 'redeem', target: 'mint-new' },
    ],
  }
}
