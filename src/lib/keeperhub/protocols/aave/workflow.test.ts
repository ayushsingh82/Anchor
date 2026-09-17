import { describe, expect, it } from 'vitest'
import { AAVE_V3_PLUGIN_ID, AaveAction } from './actions'
import { buildAaveGuardianWorkflow } from './workflow'

const CONFIG = {
  user: '0x1111111111111111111111111111111111111111',
  repayAsset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // real Base USDC, from PLAN.md
  scheduleCron: '*/5 * * * *',
  healthFactorFloor: '1500000000000000000',
}

describe('buildAaveGuardianWorkflow', () => {
  const workflow = buildAaveGuardianWorkflow(CONFIG)

  it('has one trigger and the two expected action nodes', () => {
    expect(workflow.nodes).toHaveLength(3)
    expect(workflow.nodes.map((n) => n.id)).toEqual(['trigger', 'check-health', 'repay'])
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

  it('chains trigger -> check-health -> repay with no gaps or cycles', () => {
    expect(workflow.edges).toEqual([
      { id: 'e1', source: 'trigger', target: 'check-health' },
      { id: 'e2', source: 'check-health', target: 'repay' },
    ])
  })
})
