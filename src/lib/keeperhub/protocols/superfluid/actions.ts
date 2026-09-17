/**
 * Superfluid plugin — action slugs confirmed via docs.keeperhub.com
 * (CFAv1 Forwarder, GDAv1 Forwarder, SuperToken sections).
 *
 * UNCONFIRMED: the plugin's own pluginId string wasn't given verbatim in
 * the docs text we have — 'superfluid' follows the same lowercase-slug
 * convention as 'pendle' and 'aave-v3', but treat it as inferred until
 * checked against a real workflow in the KeeperHub app.
 */

export const SUPERFLUID_PLUGIN_ID = 'superfluid'

export const SuperfluidAction = {
  // CFAv1 Forwarder (streams)
  createFlow: 'create-flow',
  updateFlow: 'update-flow',
  deleteFlow: 'delete-flow',
  getFlow: 'get-flow',
  getCfaNetFlow: 'get-cfa-net-flow',
  grantFlowOperator: 'grant-flow-operator',
  // GDAv1 Forwarder (distribution pools)
  createPool: 'create-pool',
  updateMemberUnits: 'update-member-units',
  distribute: 'distribute',
  distributeFlow: 'distribute-flow',
  connectPool: 'connect-pool',
  getNetFlow: 'get-net-flow',
  // SuperToken (wrap/unwrap)
  wrap: 'wrap',
  unwrap: 'unwrap',
  getSuperTokenBalance: 'get-super-token-balance',
  getUnderlyingToken: 'get-underlying-token',
} as const

/** Config fields confirmed for `get-super-token-balance`. */
export interface GetSuperTokenBalanceConfig {
  /** SuperToken contract address (e.g. a DAIx/USDCx address). */
  token: string
}

/** Config fields confirmed for `wrap`. */
export interface WrapConfig {
  token: string
  amount: string
}

/** Config fields confirmed for `get-net-flow` (combines CFA + GDA). */
export interface GetNetFlowConfig {
  account: string
}
