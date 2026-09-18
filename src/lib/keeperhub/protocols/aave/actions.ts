/**
 * Aave V3 plugin — confirmed via docs.keeperhub.com/plugins/aave-v3.
 * Chose V3 over V4 for this project: V4's Lido Spoke requires resolving a
 * reserveId from a Hub address + assetId before any action, and is
 * Ethereum-only. V3 takes a plain asset address directly and covers
 * Ethereum, Base, Arbitrum, and Optimism — a simpler, broader fit for a
 * health-factor guardian.
 */

export const AAVE_V3_PLUGIN_ID = 'aave-v3'

/**
 * `repay`'s `amount` accepts `type(uint256).max` to mean "repay the entire
 * debt" — confirmed directly against docs.keeperhub.com/plugins/aave-v3
 * ("Use type(uint256).max as amount to repay the entire debt"). For a
 * liquidation guardian this is the right amount anyway: once the health
 * factor has dropped below the floor, clearing the whole debt is safer
 * than computing a partial repay that might undershoot on the next price
 * move before the workflow's next scheduled run.
 */
export const MAX_UINT256 =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export const AaveAction = {
  supply: 'supply',
  withdraw: 'withdraw',
  borrow: 'borrow',
  repay: 'repay',
  setAsCollateral: 'setAsCollateral',
  getUserAccountData: 'getUserAccountData',
  getUserReserveData: 'getUserReserveData',
} as const

/** Config fields confirmed for `getUserAccountData`. Output (confirmed
 * against docs.keeperhub.com/plugins/aave-v3): `healthFactor` (18 decimals,
 * 1e18 = 1.0) — the value the guardian workflow watches — plus
 * `totalCollateralBase`, `totalDebtBase`, `availableBorrowsBase` (8-decimal
 * base currency), and `currentLiquidationThreshold`/`ltv` (basis points).
 * Only `healthFactor` is used here; the rest aren't needed once `repay`
 * uses `MAX_UINT256` instead of a computed partial-repay amount. */
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
