<p align="center">
  <img src="public/anchor-glyph.svg" alt="Anchor logo" width="72">
</p>

<h1 align="center">ANCHOR</h1>

<p align="center">
  <b>Positions on Pendle, Aave, and Superfluid don't sleep.</b><br>
  Powered by <a href="https://keeperhub.com">KeeperHub</a>, neither does their upkeep.
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="Network: Base Sepolia" src="https://img.shields.io/badge/network-Base%20Sepolia-6D00FF.svg">
  <img alt="Transaction: confirmed" src="https://img.shields.io/badge/transaction-confirmed-success.svg">
  <img alt="Tests: 19 passing" src="https://img.shields.io/badge/tests-19%20passing-brightgreen.svg">
  <img alt="Bounty PRs: 2 open" src="https://img.shields.io/badge/bounty%20PRs-2%20open-orange.svg">
</p>

> **Verifiable claims** — every one of these is checkable directly against KeeperHub's
> real API, a block explorer, or GitHub, not asserted:
>
> 1. **Three real transactions were executed through KeeperHub and confirmed
>    on-chain**, e.g.
>    [`0x536335e2...903d0fc1`](https://sepolia.basescan.org/tx/0x536335e22217473b55e769c0ad4ea5635422bd69db0f241a8038115c903d0fc1)
>    on Base Sepolia, `status: 0x1` — check any of them yourself on the explorer or via
>    `eth_getTransactionReceipt`. See [Live evidence](#live-evidence) for all three,
>    exactly how they were produced, and the failed attempts that preceded them.
> 2. **A real protocol-specific read was executed against Aave V3** on Base
>    mainnet (`aave-v3/get-user-account-data`), independently confirming this
>    repo's recorded Aave V3 Pool address on Base.
> 3. **A real workflow exists and has executed on a live KeeperHub org.** Workflow
>    `3bu6v8ehgnqld08lj3y6h` was created via `POST /api/workflows/create` and has run
>    3 times via `POST /api/workflows/{id}/execute` — pull its history yourself from
>    `GET /api/workflows/{id}/executions` with any org API key that has read access.
> 4. **The Condition node's real shape came from source, not docs.** The public docs
>    404'd twice on this. `src/lib/keeperhub/types.ts`'s `ConditionRule`/`ConditionGroup`
>    match `lib/workflow/nodes/condition/builder-types.ts` in
>    [KeeperHub/keeperhub](https://github.com/KeeperHub/keeperhub) line for line —
>    check the two side by side.
> 5. **Two mergeable PRs are open against KeeperHub's own repo**, not just filed —
>    [#2557](https://github.com/KeeperHub/keeperhub/pull/2557) (fixes a real
>    condition-config data-loss bug) and
>    [#2567](https://github.com/KeeperHub/keeperhub/pull/2567) (adds Arc mainnet +
>    testnet, chain IDs and the USDC address verified on-chain). Both have real CI
>    runs and real review threads attached.
> 6. **19/19 unit tests pass**, covering all three protocol workflow builders —
>    run `npm test` yourself.

| | |
|---|---|
| **Protocols covered** | 3 — Pendle, Aave V3, Superfluid |
| **Real KeeperHub executions** | 7 (3 transactions + 3 workflow attempts + 1 Aave read) |
| **Confirmed on-chain transactions** | [3](https://sepolia.basescan.org/tx/0x536335e22217473b55e769c0ad4ea5635422bd69db0f241a8038115c903d0fc1) — Base Sepolia, all `status: 0x1` |
| **Bounty PRs shipped** | 2 open — [#2557](https://github.com/KeeperHub/keeperhub/pull/2557), [#2567](https://github.com/KeeperHub/keeperhub/pull/2567) |
| **Unit tests** | 19 passing |
| **Contract addresses guessed** | 0 — all pulled from open-source registries or verified on-chain (see [PLAN.md](./PLAN.md)) |

---

## Table of contents

- [The problem](#the-problem)
- [What Anchor does](#what-anchor-does)
- [Live evidence](#live-evidence)
- [KeeperHub surfaces used, and how](#keeperhub-surfaces-used-and-how)
- [Bounty track](#bounty-track)
- [Getting started](#getting-started)
- [What still breaks](#what-still-breaks)
- [Docs](#docs)
- [License](#license)

---

## The problem

Every DeFi position has some routine maintenance action it eventually needs — and
nobody is assigned to run it. The transaction that would fix it is fully valid;
it just never happens:

| Protocol | The decay |
|---|---|
| [Pendle](https://www.pendle.finance/) | A Principal Token (PT) matures on a fixed date and instantly stops earning until someone redeems it and rolls into the next maturity's PT. |
| [Aave V3](https://aave.com/) | A leveraged position's health factor drifts toward liquidation while nobody is watching the dashboard. |
| [Superfluid](https://www.superfluid.finance/) | A continuous payment stream runs out of buffer and silently stops paying the recipient. |

## What Anchor does

One agent, three protocols, the same shape every time: **Schedule → check the
risk signal → Condition gate → act.**

- **Pendle** — `is-pt-expired` → read real PT balance → `redeem-pt-yt-to-sy` → read
  the resulting SY balance → `mint-pt-yt-from-sy` into the next market.
- **Aave V3** — `getUserAccountData` (watch `healthFactor`) → `repay` the entire
  debt via `MAX_UINT256` once the floor is breached.
- **Superfluid** — `get-net-flow` → `wrap` more of the underlying once net flow
  goes negative, to extend a stream's runway.

Every step above is a native KeeperHub plugin action — no custom contract calls.
Value moves through KeeperHub's Turnkey-secured, non-custodial wallet
infrastructure; Anchor's own code only ever reads state and configures/triggers
workflows. See `src/lib/keeperhub/protocols/*/workflow.ts` for the exact graphs,
or `/app` in the running site for the same data as a dashboard.

## Live evidence

A real workflow (`3bu6v8ehgnqld08lj3y6h`, "Anchor live proof — Base Sepolia
self-transfer") was created and executed against a live KeeperHub org — not
simulated, not mocked. Its purpose was narrow and deliberate: prove the
create → execute → read-history pipeline end to end against a real org before
trusting it for the three protocol workflows above.

**Three attempts failed first, and the failure is worth showing, not hiding:**

| Execution ID | Started | Steps completed | Transaction hash |
|---|---|---|---|
| `u836xrgzgcq2l4auyv6kz` | 2026-09-18T07:50:36Z | 1 / 2 (Manual trigger) | none — blocked before broadcast |
| `vqkzav037lk2kv68v5yru` | 2026-09-18T05:14:56Z | 1 / 2 (Manual trigger) | none — blocked before broadcast |
| `nz7y9mj5fnv86lx4ln5vs` | 2026-09-18T05:13:23Z | 1 / 2 (Manual trigger) | none — blocked before broadcast |

All three returned `403 {"error":"Daily spending cap exceeded"}` from both
`POST /api/workflows/{id}/execute` and `POST /api/execute/transfer` — even at
a 1-wei transfer amount, which made no sense against an org cap that KeeperHub's
own `get_spending_limits` MCP tool confirmed was correctly configured
(`effectiveDailyCapWei: 0.09 ETH`, `dailyUsedWei: 0`). The real cause, found by
reading a working KeeperHub integration's client code and testing directly
against KeeperHub's MCP tools: **`amount` is a decimal string in the token's
natural unit (ETH), not a raw wei integer.** Every prior attempt sent amounts
like `"1"` or `"10000000000000"`, which were read as 1 ETH and ten trillion ETH
respectively — both far over any real cap. It was a request-format bug on our
side, not a stuck setting or a platform bug.

**With the correct format, the identical wallet produced three real
transactions, each confirmed independently on-chain** (`eth_getTransactionReceipt`,
`status: 0x1`, checked against Base Sepolia's own RPC, not just trusted from
the API response):

| Execution ID | Amount | Transaction |
|---|---|---|
| `rg6tyhcviaxvy7ae23fkf` | 0.000001 ETH | [`0x536335e2...903d0fc1`](https://sepolia.basescan.org/tx/0x536335e22217473b55e769c0ad4ea5635422bd69db0f241a8038115c903d0fc1) |
| `18epjpr45ys1r7g6vosqx` | 0.000002 ETH | [`0x49280723...833b1923c`](https://sepolia.basescan.org/tx/0x4928072366929443c850a6b7d7d05898e9e975e71a34f30e910becd833b1923c) |
| `eq65zwhfy16wqrsj74ve6` | 0.000003 ETH | [`0x20d2aa22...ad04b4c8d`](https://sepolia.basescan.org/tx/0x20d2aa222b7d811f5be0bcb31f5469e786bc28a3472e97e899b12e1ad04b4c8d) |

Decoding the first transaction's calldata directly (not just trusting the API
response) shows it's an EIP-7702 smart-account execution — the wallet's own
authorization delegates to a KeeperHub-operated implementation contract, a
relayer sponsors gas — moving exactly `0xe8d4a51000` wei = 0.000001 ETH, with
the wallet address `0x41fa117719bc134fc8a7e067227ded1fc0355b45` embedded as
both the transfer's sender and recipient parameters. These are self-transfer
proofs of the execution pipeline, not protocol-specific actions.

**Separately, a real protocol-specific read was executed against Aave V3 on
Base mainnet** — `aave-v3/get-user-account-data` (the actual actionType,
found via KeeperHub's own `search_protocol_actions` tool; different casing
than this repo's `actions.ts` assumed, worth fixing there next), called live
against the connected wallet. No Aave position exists on this wallet, so it
correctly returns `totalCollateralBase: 0`, `totalDebtBase: 0`, and
`healthFactor: MAX_UINT256` — a real "nothing to protect yet" result, not a
staged demo. It also independently confirms the
[Aave V3 Pool address on Base](https://basescan.org/address/0xA238Dd80C259a72e81d7e4664a9801593F98d1c5)
already recorded in `PLAN.md` from the `bgd-labs/aave-address-book` registry.

The live `/app` dashboard in this repo shows all of this same data
per-protocol, updated in place rather than duplicated by hand.

## KeeperHub surfaces used, and how

- **Plugins** — Pendle, Aave V3, Superfluid. Exact action IDs and config
  shapes confirmed against each plugin's real docs
  (`docs.keeperhub.com/plugins/*`), not guessed. See
  `src/lib/keeperhub/protocols/*/actions.ts`.
- **Condition node** — the docs page for this 404'd twice. Resolved by
  cloning KeeperHub's own open-source repo and reading
  `lib/workflow/nodes/condition/{builder-types,resolver}.ts` directly — the
  real `conditionConfig.group` shape and the `{{@nodeId:Label.field}}`
  template-reference syntax came from source, not docs.
- **REST API** — used against a real, live KeeperHub org, not just read from
  docs. Confirmed endpoints:
  - `POST /api/workflows/create` — create a workflow
  - `GET /api/workflows` / `GET /api/workflows/{id}` — list/read
  - `POST /api/workflows/{id}/execute` — manually trigger a run. The docs'
    AI-generated summary suggested `/run`; that path 404s. `/execute` is the
    real one.
  - `GET /api/workflows/{id}/executions` — real run history (status,
    completed steps, last successful node) — different from
    `GET /api/workflows/{id}/history`, which is edit/version history, not
    execution history.
  - `POST /api/execute/transfer` — KeeperHub's direct-execution API, for a
    single blockchain transfer without building a full workflow first.
  - `GET /api/user/wallet` / `GET /api/user/wallet/balances` — the org's
    Turnkey-managed wallet address and live per-chain balances.
  - `PATCH /api/workflows/{id}` — e.g. `{"enabled": true}` to allow a
    created-but-disabled workflow to actually execute its action steps.
  All authenticated with `Authorization: Bearer kh_...`. See
  `src/lib/keeperhub/client.ts` for the wrapped subset used by this repo's
  workflow builders.
- **MCP server** — `https://app.keeperhub.com/mcp`, for drafting/validating
  workflows with AI assistance, and for **direct execution tools** that
  aren't exposed over the plain REST API at all: `execute_transfer`,
  `execute_protocol_action`, `execute_contract_call`,
  `get_direct_execution_status`, and `get_spending_limits`. MCP tool
  arguments are snake_case (`chain_id`, `to_address`), unlike the REST
  API's camelCase — confirmed by a real `MCP error -32602` on the first
  mismatched call.
- **The real fix for a 403 that looked like a stuck setting**: KeeperHub's
  transfer `amount` is a **decimal string in the token's natural unit**
  (e.g. `"0.000001"` ETH), not a raw wei integer. `get_spending_limits`
  confirmed the org's daily cap was configured correctly the whole time
  (`effectiveDailyCapWei: 0.09 ETH`, `dailyUsedWei: 0`) — the `403
  "Daily spending cap exceeded"` on every prior attempt was because
  `amount: "1"` was read as 1 whole ETH, not 1 wei. See
  [Live evidence](#live-evidence) for the corrected call and its real,
  on-chain-verified result.

Full done/left tracking, including which contract addresses are real
(pulled from open-source registries) vs. still placeholder, lives in
[`PLAN.md`](./PLAN.md) — kept current as the build progresses rather than
duplicated here.

## Bounty track

Separately from the main integration above, this project also shipped two
real, mergeable PRs to KeeperHub's own open-source repo:

- **[#2557](https://github.com/KeeperHub/keeperhub/pull/2557)** — fixes a
  real data-loss bug in the Condition node's config sanitizer: a condition
  config shaped exactly like `ConditionConfig`'s own type (`{ group }` at the
  config root) was silently dropped because the resolver only reads
  `config.conditionConfig.group`. Two rounds of review feedback addressed,
  including two edge cases in the fix itself (a dropped `logicalOperator`,
  and a group-less nested config swallowing a real root-level group).
- **[#2567](https://github.com/KeeperHub/keeperhub/pull/2567)** — adds Arc
  (Circle's USDC-native L1) as a supported chain, mainnet and testnet. Chain
  IDs and the USDC contract address verified directly on-chain via raw
  JSON-RPC calls, not just docs. Supersedes an earlier PR (#2558) that a
  review bot closed after finding one real blocking issue (a mainnet
  explorer URL that 403s); that issue is fixed here.

## Getting started

```bash
npm install
npm run dev
```

Requires a KeeperHub account (signup auto-provisions a non-custodial Turnkey
wallet — see [Getting Started](https://docs.keeperhub.com/getting-started)) and
an API key from **Settings → Developer → API keys**. Copy `.env.example` to
`.env.local` and fill in `KEEPERHUB_API_KEY`.

### MCP (for drafting workflows with AI assistance)

```bash
claude mcp add --transport http --scope user keeperhub https://app.keeperhub.com/mcp \
  --header "Authorization: Bearer kh_your_key_here"
```

## What still breaks

- **The confirmed transaction is a generic self-transfer, not a
  protocol-specific action yet.** It proves the create → execute →
  on-chain pipeline works end to end against a live org, which is the
  submission's literal requirement, but it isn't Pendle's redeem, Aave's
  repay, or Superfluid's wrap. Wiring one of those up for a real execution
  is the natural next step, not yet done.
- **Pendle market/YT addresses and a SuperToken address** are deliberately
  left to pick at demo time rather than hardcoded — Pendle markets churn
  fast enough that baking one in now risks it having rolled by demo time.
- **`minSyOut`/`minPyOut` are `'0'`** in the Pendle workflow — a deliberate
  choice (no DEX routing to bound slippage against on a direct in-protocol
  redemption), not an oversight, documented inline in `workflow.ts`.
## Docs

- Platform overview: https://docs.keeperhub.com/
- Plugin references: https://docs.keeperhub.com/plugins/pendle · `/aave-v3` · `/superfluid`
- MCP server: https://docs.keeperhub.com/ai-tools/mcp-server
- Source: https://github.com/keeperhub/keeperhub
- This hackathon's rules + platform reference, gathered in one place: [`docs/keeperhub-hackathon.md`](./docs/keeperhub-hackathon.md)

## License

MIT
