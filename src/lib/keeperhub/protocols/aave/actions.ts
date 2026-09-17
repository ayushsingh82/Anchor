/**
 * Aave V3 plugin — confirmed via docs.keeperhub.com/plugins/aave-v3.
 * Chose V3 over V4 for this project: V4's Lido Spoke requires resolving a
 * reserveId from a Hub address + assetId before any action, and is
 * Ethereum-only. V3 takes a plain asset address directly and covers
 * Ethereum, Base, Arbitrum, and Optimism — a simpler, broader fit for a
 * health-factor guardian.
 */

export const AAVE_V3_PLUGIN_ID = 'aave-v3'

export const AaveAction = {
  supply: 'supply',
  withdraw: 'withdraw',
  borrow: 'borrow',
  repay: 'repay',
  setAsCollateral: 'setAsCollateral',
  getUserAccountData: 'getUserAccountData',
  getUserReserveData: 'getUserReserveData',
} as const

/** Config fields confirmed for `getUserAccountData`. Output includes
 * `healthFactor` (18 decimals) — the value the guardian workflow watches. */
export interface GetUserAccountDataConfig {
  user: string
}

/** Config fields confirmed for `repay`. */
export interface RepayConfig {
  asset: string
  amount: string
  interestRateMode: string
  onBehalfOf: string
}

/** Config fields confirmed for `supply`. */
export interface SupplyConfig {
  asset: string
  amount: string
  onBehalfOf: string
  referralCode: string
}
