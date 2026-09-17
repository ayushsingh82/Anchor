/**
 * Pendle plugin action IDs, confirmed from docs.keeperhub.com/plugins/pendle.
 *
 * UNCONFIRMED: how a market/PT is bound to a read action like `is-pt-expired`
 * or `get-market-expiry` — the docs show them taking no explicit address
 * argument, which suggests the target market is set on a pre-configured
 * "connection" (see docs sidebar: Notifications > Connections is the
 * confirmed use of that concept; plugins likely follow the same pattern).
 * Needs confirming directly in the KeeperHub app before wiring a real node.
 */

export const PENDLE_PLUGIN_ID = 'pendle'

export const PendleAction = {
  isPtExpired: 'is-pt-expired',
  isMarketExpired: 'is-market-expired',
  getMarketExpiry: 'get-market-expiry',
  getPtBalance: 'get-pt-balance',
  getSyBalance: 'get-sy-balance',
  getSyExchangeRate: 'get-sy-exchange-rate',
  redeemPtYtToSy: 'redeem-pt-yt-to-sy',
  mintPtYtFromSy: 'mint-pt-yt-from-sy',
} as const

/** Config fields confirmed for `redeem-pt-yt-to-sy`. */
export interface RedeemPtYtToSyConfig {
  receiver: string
  YT: string
  netPyIn: string
  minSyOut: string
}

/** Config fields confirmed for `mint-pt-yt-from-sy`. */
export interface MintPtYtFromSyConfig {
  receiver: string
  YT: string
  netSyIn: string
  minPyOut: string
}
