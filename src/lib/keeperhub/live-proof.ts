/**
 * Real execution data against the live KeeperHub org — not fabricated.
 *
 * Three early attempts via the REST API (POST /api/workflows/{id}/execute,
 * POST /api/execute/transfer) all returned 403 "Daily spending cap exceeded",
 * even at a 1-wei amount. Root cause, found by reading a real working
 * integration's client code and testing directly against KeeperHub's MCP
 * tools: `amount` is a decimal string in the token's natural unit (ETH), not
 * a raw wei integer -- "1" was being read as 1 whole ETH. `get_spending_limits`
 * (an MCP tool) confirmed the cap itself was configured correctly the whole
 * time (effectiveDailyCapWei 0.09 ETH, dailyUsedWei 0) -- this was a unit
 * mismatch on the request, not a platform bug or a stuck setting.
 *
 * With the correct decimal format, `execute_transfer` (MCP tool,
 * https://app.keeperhub.com/mcp) produced three real, independently
 * on-chain-verified transactions (eth_getTransactionReceipt, status 0x1,
 * checked against Base Sepolia's own RPC, not just trusted from the API
 * response). Each is an EIP-7702 smart-account execution -- our wallet's
 * authorization delegates to a KeeperHub-operated implementation contract,
 * a relayer sponsors gas -- with our wallet address embedded in the calldata
 * as both sender and recipient (these are self-transfer proofs of the
 * execution pipeline, not protocol-specific actions).
 *
 * Separately, a real protocol-specific read was executed against Aave V3 on
 * Base mainnet (`aave-v3/get-user-account-data`, the actual actionType --
 * different casing than assumed in protocols/aave/actions.ts, worth fixing
 * there next) -- no position exists on this wallet, so it correctly reports
 * zero collateral/debt and healthFactor at MAX_UINT256, and independently
 * confirms this repo's already-recorded Aave V3 Pool address on Base
 * (0xA238Dd80C259a72e81d7e4664a9801593F98d1c5, from PLAN.md).
 *
 * Shared by the landing page and /app so both show the same real numbers
 * instead of two hand-maintained copies drifting apart.
 */

// The org's real Turnkey-managed wallet (confirmed live via GET /api/user/wallet).
// Funded with Base Sepolia testnet ETH.
export const CONNECTED_WALLET = '0x41fa117719bc134fc8a7e067227ded1fc0355b45'

export const LIVE_PROOF = {
  workflowId: '3bu6v8ehgnqld08lj3y6h',
  workflowName: 'Anchor live proof — Base Sepolia self-transfer',

  // Earlier attempts, kept for the record -- all blocked by the unit-format
  // bug described above, not a real platform or account issue.
  executions: [
    { id: 'u836xrgzgcq2l4auyv6kz', startedAt: '2026-09-18T07:50:36.426Z', completedSteps: '1 / 2', lastNode: 'Manual (trigger)', outcome: 'blocked before the transfer step (amount unit bug)' },
    { id: 'vqkzav037lk2kv68v5yru', startedAt: '2026-09-18T05:14:56.745Z', completedSteps: '1 / 2', lastNode: 'Manual (trigger)', outcome: 'blocked before the transfer step (amount unit bug)' },
    { id: 'nz7y9mj5fnv86lx4ln5vs', startedAt: '2026-09-18T05:13:23.355Z', completedSteps: '1 / 2', lastNode: 'Manual (trigger)', outcome: 'blocked before the transfer step (amount unit bug)' },
  ],
  blocker: 'Daily spending cap exceeded (root cause: amount unit mismatch, since fixed)',

  // Real, on-chain-confirmed transactions, most recent first.
  transactions: [
    { executionId: 'eq65zwhfy16wqrsj74ve6', transactionHash: '0x20d2aa222b7d811f5be0bcb31f5469e786bc28a3472e97e899b12e1ad04b4c8d', amountEth: '0.000003' },
    { executionId: '18epjpr45ys1r7g6vosqx', transactionHash: '0x4928072366929443c850a6b7d7d05898e9e975e71a34f30e910becd833b1923c', amountEth: '0.000002' },
    { executionId: 'rg6tyhcviaxvy7ae23fkf', transactionHash: '0x536335e22217473b55e769c0ad4ea5635422bd69db0f241a8038115c903d0fc1', amountEth: '0.000001' },
  ].map((tx) => ({
    ...tx,
    transactionLink: `https://sepolia.basescan.org/tx/${tx.transactionHash}`,
  })),

  // Real, protocol-specific read -- executed via execute_protocol_action,
  // actionType aave-v3/get-user-account-data, network 8453 (Base mainnet),
  // user = the connected wallet. No Aave position exists on this wallet,
  // so this is a real "nothing to protect yet" result, not a guarded demo.
  aaveRead: {
    actionType: 'aave-v3/get-user-account-data',
    network: '8453 (Base mainnet)',
    result: {
      totalCollateralBase: '0',
      totalDebtBase: '0',
      healthFactor: 'MAX_UINT256 (no debt)',
    },
    poolAddressLink: 'https://basescan.org/address/0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  },
}
