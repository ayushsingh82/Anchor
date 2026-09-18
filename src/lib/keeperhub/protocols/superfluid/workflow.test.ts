import { describe, expect, it } from 'vitest'
import { SUPERFLUID_PLUGIN_ID, SuperfluidAction } from './actions'
import { buildSuperfluidGuardianWorkflow } from './workflow'

const CONFIG = {
  account: '0x1111111111111111111111111111111111111111',
  token: '0x2222222222222222222222222222222222222222',
  topUpAmount: '1000000000000000000',
  scheduleCron: '0 * * * *',
}

describe('buildSuperfluidGuardianWorkflow', () => {
  const workflow = buildSuperfluidGuardianWorkflow(CONFIG)

  it('has one trigger, the condition gate, and the two expected action nodes', () => {
    expect(workflow.nodes).toHaveLength(4)
    expect(workflow.nodes.map((n) => n.id)).toEqual(['trigger', 'check-flow', 'gate-outflow', 'top-up'])
  })

  it('wires the schedule trigger with the given cron', () => {
    expect(workflow.nodes[0].data.config).toMatchObject({ triggerType: 'Schedule', cron: CONFIG.scheduleCron })
  })

  it('uses the confirmed Superfluid plugin ID and action IDs', () => {
    const check = workflow.nodes.find((n) => n.id === 'check-flow')!
    const topUp = workflow.nodes.find((n) => n.id === 'top-up')!
    expect(check.data.config).toMatchObject({
      pluginId: SUPERFLUID_PLUGIN_ID,
      actionId: SuperfluidAction.getNetFlow,
      account: CONFIG.account,
    })
    expect(topUp.data.config).toMatchObject({
      pluginId: SUPERFLUID_PLUGIN_ID,
      actionId: SuperfluidAction.wrap,
      token: CONFIG.token,
      amount: CONFIG.topUpAmount,
    })
  })

  it('gates the top-up on net flow going negative', () => {
    const gate = workflow.nodes.find((n) => n.id === 'gate-outflow')!
    const config = gate.data.config as { conditionConfig: { group: { rules: Array<Record<string, unknown>> } } }
    const rule = config.conditionConfig.group.rules[0]
    expect(rule).toMatchObject({ operator: '<', rightOperand: '0' })
    expect(rule.leftOperand).toContain('check-flow')
  })

  it('chains trigger -> check-flow -> gate -> top-up with no gaps or cycles', () => {
    expect(workflow.edges).toEqual([
      { id: 'e1', source: 'trigger', target: 'check-flow' },
      { id: 'e2', source: 'check-flow', target: 'gate-outflow' },
      { id: 'e3', source: 'gate-outflow', target: 'top-up' },
    ])
  })
})
