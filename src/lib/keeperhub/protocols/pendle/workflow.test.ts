import { describe, expect, it } from 'vitest'
import { PENDLE_PLUGIN_ID, PendleAction } from './actions'
import { buildPendleRolloverWorkflow } from './workflow'

const CONFIG = {
  receiver: '0x1111111111111111111111111111111111111111',
  oldYT: '0x2222222222222222222222222222222222222222',
  newYT: '0x3333333333333333333333333333333333333333',
  scheduleCron: '0 * * * *',
}

describe('buildPendleRolloverWorkflow', () => {
  const workflow = buildPendleRolloverWorkflow(CONFIG)

  it('has one trigger and the three expected action nodes', () => {
    expect(workflow.nodes).toHaveLength(4)
    expect(workflow.nodes.map((n) => n.id)).toEqual(['trigger', 'check-expired', 'redeem', 'mint-new'])
  })

  it('wires the schedule trigger with the given cron', () => {
    const trigger = workflow.nodes[0]
    expect(trigger.data.config).toMatchObject({ triggerType: 'Schedule', cron: CONFIG.scheduleCron })
  })

  it('uses the confirmed Pendle plugin ID and action IDs in order', () => {
    const [, check, redeem, mint] = workflow.nodes
    expect(check.data.config).toMatchObject({ pluginId: PENDLE_PLUGIN_ID, actionId: PendleAction.isPtExpired })
    expect(redeem.data.config).toMatchObject({ pluginId: PENDLE_PLUGIN_ID, actionId: PendleAction.redeemPtYtToSy })
    expect(mint.data.config).toMatchObject({ pluginId: PENDLE_PLUGIN_ID, actionId: PendleAction.mintPtYtFromSy })
  })

  it('redeems from the old market and mints into the new one', () => {
    const redeem = workflow.nodes.find((n) => n.id === 'redeem')!
    const mint = workflow.nodes.find((n) => n.id === 'mint-new')!
    expect(redeem.data.config.YT).toBe(CONFIG.oldYT)
    expect(mint.data.config.YT).toBe(CONFIG.newYT)
    expect(redeem.data.config.receiver).toBe(CONFIG.receiver)
    expect(mint.data.config.receiver).toBe(CONFIG.receiver)
  })

  it('chains trigger -> check -> redeem -> mint with no gaps or cycles', () => {
    expect(workflow.edges).toEqual([
      { id: 'e1', source: 'trigger', target: 'check-expired' },
      { id: 'e2', source: 'check-expired', target: 'redeem' },
      { id: 'e3', source: 'redeem', target: 'mint-new' },
    ])
  })
})
