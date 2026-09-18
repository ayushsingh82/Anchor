import { describe, expect, it } from 'vitest'
import { AAVE_V3_PLUGIN_ID, AaveAction, MAX_UINT256 } from './actions'
import { buildAaveGuardianWorkflow } from './workflow'

const CONFIG = {
  user: '0x1111111111111111111111111111111111111111',
  repayAsset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // real Base USDC, from PLAN.md
  scheduleCron: '*/5 * * * *',
  healthFactorFloor: '1500000000000000000',
}

describe('buildAaveGuardianWorkflow', () => {
  const workflow = buildAaveGuardianWorkflow(CONFIG)

  it('has one trigger, the condition gate, and the two expected action nodes', () => {
    expect(workflow.nodes).toHaveLength(4)
    expect(workflow.nodes.map((n) => n.id)).toEqual(['trigger', 'check-health', 'gate-unhealthy', 'repay'])
  })

  it('wires the schedule trigger with the given cron', () => {
    expect(workflow.nodes[0].data.config).toMatchObject({ triggerType: 'Schedule', cron: CONFIG.scheduleCron })
  })

  it('uses the confirmed Aave V3 plugin ID and action IDs', () => {
    const check = workflow.nodes.find((n) => n.id === 'check-health')!
    const repay = workflow.nodes.find((n) => n.id === 'repay')!
    expect(check.data.config).toMatchObject({
      pluginId: AAVE_V3_PLUGIN_ID,
      actionId: AaveAction.getUserAccountData,
      user: CONFIG.user,
    })
    expect(repay.data.config).toMatchObject({
      pluginId: AAVE_V3_PLUGIN_ID,
      actionId: AaveAction.repay,
      asset: CONFIG.repayAsset,
      onBehalfOf: CONFIG.user,
    })
  })

  it('repays the entire debt via MAX_UINT256 rather than a computed partial amount', () => {
    const repay = workflow.nodes.find((n) => n.id === 'repay')!
    expect(repay.data.config.amount).toBe(MAX_UINT256)
  })

  it('gates the repay step on the health factor dropping below the configured floor', () => {
    const gate = workflow.nodes.find((n) => n.id === 'gate-unhealthy')!
    const config = gate.data.config as { conditionConfig: { group: { rules: Array<Record<string, unknown>> } } }
    const rule = config.conditionConfig.group.rules[0]
    expect(rule).toMatchObject({ operator: '<', rightOperand: CONFIG.healthFactorFloor })
    expect(rule.leftOperand).toContain('check-health')
    expect(rule.leftOperand).toContain('healthFactor')
  })

  it('chains trigger -> check-health -> gate -> repay with no gaps or cycles', () => {
    expect(workflow.edges).toEqual([
      { id: 'e1', source: 'trigger', target: 'check-health' },
      { id: 'e2', source: 'check-health', target: 'gate-unhealthy' },
      { id: 'e3', source: 'gate-unhealthy', target: 'repay' },
    ])
  })
})
