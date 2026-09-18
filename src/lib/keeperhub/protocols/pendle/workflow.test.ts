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

  it('has one trigger, the condition gate, both balance reads, and the two mutating actions', () => {
    expect(workflow.nodes).toHaveLength(7)
    expect(workflow.nodes.map((n) => n.id)).toEqual([
      'trigger',
      'check-expired',
      'gate-expired',
      'pt-balance',
      'redeem',
      'sy-balance',
      'mint-new',
    ])
  })

  it('wires the schedule trigger with the given cron', () => {
    const trigger = workflow.nodes[0]
    expect(trigger.data.config).toMatchObject({ triggerType: 'Schedule', cron: CONFIG.scheduleCron })
  })

  it('uses the confirmed Pendle plugin ID and action IDs in order', () => {
    const check = workflow.nodes.find((n) => n.id === 'check-expired')!
    const redeem = workflow.nodes.find((n) => n.id === 'redeem')!
    const mint = workflow.nodes.find((n) => n.id === 'mint-new')!
    expect(check.data.config).toMatchObject({ pluginId: PENDLE_PLUGIN_ID, actionId: PendleAction.isPtExpired })
    expect(redeem.data.config).toMatchObject({ pluginId: PENDLE_PLUGIN_ID, actionId: PendleAction.redeemPtYtToSy })
    expect(mint.data.config).toMatchObject({ pluginId: PENDLE_PLUGIN_ID, actionId: PendleAction.mintPtYtFromSy })
  })

  it('gates the redeem step on the expired flag being true', () => {
    const gate = workflow.nodes.find((n) => n.id === 'gate-expired')!
    const config = gate.data.config as { conditionConfig: { group: { rules: Array<Record<string, unknown>> } } }
    const rule = config.conditionConfig.group.rules[0]
    expect(rule).toMatchObject({ operator: 'isTrue' })
    expect(rule.leftOperand).toContain('check-expired')
    expect(rule.leftOperand).toContain('expired')
  })

  it('redeems from the old market and mints into the new one', () => {
    const redeem = workflow.nodes.find((n) => n.id === 'redeem')!
    const mint = workflow.nodes.find((n) => n.id === 'mint-new')!
    expect(redeem.data.config.YT).toBe(CONFIG.oldYT)
    expect(mint.data.config.YT).toBe(CONFIG.newYT)
    expect(redeem.data.config.receiver).toBe(CONFIG.receiver)
    expect(mint.data.config.receiver).toBe(CONFIG.receiver)
  })

  it('reads the PT and SY balances for the receiver before spending them', () => {
    const ptBalance = workflow.nodes.find((n) => n.id === 'pt-balance')!
    const syBalance = workflow.nodes.find((n) => n.id === 'sy-balance')!
    expect(ptBalance.data.config).toMatchObject({
      pluginId: PENDLE_PLUGIN_ID,
      actionId: PendleAction.getPtBalance,
      account: CONFIG.receiver,
    })
    expect(syBalance.data.config).toMatchObject({
      pluginId: PENDLE_PLUGIN_ID,
      actionId: PendleAction.getSyBalance,
      account: CONFIG.receiver,
    })
  })

  it('redeems the full PT balance and mints from the full resulting SY balance, not a fixed amount', () => {
    const redeem = workflow.nodes.find((n) => n.id === 'redeem')!
    const mint = workflow.nodes.find((n) => n.id === 'mint-new')!
    expect(redeem.data.config.netPyIn).toContain('pt-balance')
    expect(redeem.data.config.netPyIn).toContain('balance')
    expect(mint.data.config.netSyIn).toContain('sy-balance')
    expect(mint.data.config.netSyIn).toContain('balance')
  })

  it('chains trigger -> check -> gate -> pt-balance -> redeem -> sy-balance -> mint with no gaps or cycles', () => {
    expect(workflow.edges).toEqual([
      { id: 'e1', source: 'trigger', target: 'check-expired' },
      { id: 'e2', source: 'check-expired', target: 'gate-expired' },
      { id: 'e3', source: 'gate-expired', target: 'pt-balance' },
      { id: 'e4', source: 'pt-balance', target: 'redeem' },
      { id: 'e5', source: 'redeem', target: 'sy-balance' },
      { id: 'e6', source: 'sy-balance', target: 'mint-new' },
    ])
  })
})
