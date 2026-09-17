# Anchor — Build Plan

KeeperHub Agent Economy Hackathon (main track: Best Integration into a Live
Project). Deadline **2026-09-18, 12:00 CEST**.

## What Anchor is

One agent, three protocols, the same fix each time: a DeFi position needs
routine upkeep nobody remembers to do, so KeeperHub does it on a schedule.

| Protocol | The decay | The fix |
|---|---|---|
| Pendle | PT matures, stops earning | redeem → mint into next maturity |
| Aave V3 | Health factor drifts toward liquidation | repay debt |
| Superfluid | A stream's buffer runs dry, payment stops | wrap more of the underlying |

## Done

- [x] KeeperHub REST client (`src/lib/keeperhub/client.ts`) — auth header,
      create/list/get-history endpoints, confirmed against docs
- [x] Workflow schema types (`src/lib/keeperhub/types.ts`) — nodes, edges,
      trigger types, confirmed against `docs.keeperhub.com/workflows/schema-reference`
- [x] Per-protocol folders, each with `actions.ts` (plugin ID + exact
      action-slug constants, confirmed against the actual plugin docs
      pasted into this session) and `workflow.ts` (draft `Schedule → check →
      act` graph):
  - `src/lib/keeperhub/protocols/pendle/`
  - `src/lib/keeperhub/protocols/aave/`
  - `src/lib/keeperhub/protocols/superfluid/`
- [x] Landing page (`src/app/page.tsx`) — hero, a 3-protocol section with
      custom SVG brand-color badges, a KeeperHub-platform features section,
      final CTA, footer. Original design (see below for why it isn't a
      cloned template).
- [x] `docs/keeperhub-hackathon.md` — full rules, prize/judging breakdown,
      platform reference pulled from `docs.keeperhub.com`
- [x] GitHub repo renamed `NimTable` → `Anchor` (github.com/ayushsingh82/Anchor),
      package.json / branding updated to match
- [x] Git history for this repo was squashed to a clean 10-commit
      progression earlier in the build (no leftover unrelated history)
- [x] Unit tests for all three workflow builders (`*/workflow.test.ts`,
      Vitest) — 16 tests, verifying node wiring, correct plugin/action IDs,
      config propagation, and (now) the condition-gate rule shape. `npm test`.
- [x] **Condition/branch node — confirmed, no longer a guess.** Docs 404'd
      twice; resolved by cloning KeeperHub's own open-source repo and
      reading `lib/workflow/nodes/condition/{builder-types,resolver,expression}.ts`
      directly. Real shape:
      ```
      config: { conditionConfig: { group: { id, logic: "AND"|"OR",
        rules: [{ id, leftOperand, operator, rightOperand }] } } }
      ```
      and the template-reference syntax is `{{@nodeId:Label.field}}` (label
      must match the referenced node's `data.label`). Added to
      `src/lib/keeperhub/types.ts` (`ConditionRule`, `ConditionGroup`,
      `templateRef()`, `singleRuleCondition()`) and wired into all three
      workflows as a real `gate-*` node between the check and the action.
      This closes the single biggest open blocker from every previous
      version of this file.

## Explicitly declined

Two landing-page specs were provided mid-build that turned out to be
pixel-precise reverse-engineering of specific real, live companies' actual
marketing sites (exact copy, exact hosted video assets, exact measurements
solved against their real render). Declined to clone either verbatim;
built an original design in the same general style instead (dark theme,
staged text-reveal entrance, card-based sections). Documenting this here
so it's clear why the landing page doesn't match those two references —
if a similar-looking spec shows up again, same call applies.

## Real addresses gathered so far (from public, static registries — not guessed)

Needed because every workflow's `config` fields want a concrete address,
not a protocol name.

**Aave V3 — Base mainnet** (from `bgd-labs/aave-address-book`, MIT-licensed,
the canonical open-source registry the Aave ecosystem itself uses):
- Pool: `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5`
- USDC (underlying): `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

**Superfluid — all chains** (forwarder addresses are identical everywhere
per KeeperHub's own plugin docs):
- CFAv1Forwarder: `0xcfA132E353cB4E398080B9700609bb008eceB125` — confirmed
  directly against Etherscan (primary source).
- GDAv1Forwarder: `0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08` — confirmed
  directly against Etherscan (verified contract name matches).
- No specific SuperToken (e.g. USDCx on Base) address confirmed yet — per
  the plugin docs this is "user-provided" per workflow anyway, so it can be
  picked directly in the KeeperHub app rather than hardcoded here.

**Pendle — Ethereum mainnet** (from Pendle's own public API,
`api-v2.pendle.finance/core/v1/1/markets/active`), three currently-active
markets as of this session:

| Market | Address | YT | Expiry |
|---|---|---|---|
| wstETH | `0x34280882267ffa6383b363e278b027be083bbe3b` | `0x04b7fa1e727d7290d6e24fa9b426d0c940283a95` | 2027-12-30 |
| ynRWAx | `0xfce3f966a131c46a51b896ceea3917bc4c302577` | `0x2263fdec108939ae8fd0ab41901fa9755203b232` | 2026-10-15 |
| sYUSD | `0x440a67f76f569b67a993aeaff58d198705ec5fe4` | `0xfa780e1c8169c83dd63ccd22a4b89e2fefdb97b2` | 2026-09-24 |

Still not baked into the workflow config, deliberately: these are
Ethereum mainnet markets, real value, and Pendle markets churn — the
"next market to roll into" pairing needs to be picked fresh right before
the demo (e.g. sYUSD expires 2026-09-24, after the hackathon deadline, so
it wouldn't even demonstrate the redeem step live). A testnet market would
be safer for a live demo if the plugin's Pendle deployment supports one.

## Left — before this can execute anything real

- [x] ~~No live KeeperHub account/API key wired in~~ — resolved. A real
      org API key (`Write` scope, `mcp:read`/`mcp:write`) is in
      `.env.local` (gitignored, never committed) and confirmed live:
      `GET /api/workflows` returns 200 against `app.keeperhub.com`, so
      `client.ts`'s REST shape is correct against the real API, not just
      docs.
- [ ] **Wallet is funded with nothing.** `GET /api/user/wallet` confirms
      the org's Turnkey-managed wallet: `0x41fa117719bc134fc8a7e067227ded1fc0355b45`
      (created 2026-09-17). `GET /api/user/wallet/balances` shows **zero
      balance on every chain KeeperHub supports, mainnet and testnet** —
      no gas, no stablecoins anywhere. (Tempo/Tempo Testnet report a
      garbage `nativeBalanceRaw` of repeating "42"s — not real funds,
      disregarded.) This is now the actual hard blocker for the
      submission's required "link to a transaction executed through
      KeeperHub": nothing can execute without gas. Two automated
      no-auth-faucet attempts (Base's own faucet endpoint, QuickNode's
      API) both failed as expected — real faucets gate behind
      CAPTCHA/wallet-connect specifically to stop scripted draining.
      Waiting on manual funding: send Base Sepolia testnet ETH to the
      address above via https://www.base.org/faucet or
      https://www.alchemy.com/faucets/base-sepolia, then the plan is to
      trigger a real workflow and capture the resulting tx hash.
- [ ] **Pendle market + YT addresses** for both the expiring and next
      market — pick these live from app.pendle.finance right before the
      demo, not now (see the gathered-addresses section above).
- [ ] **A concrete SuperToken address** (e.g. USDCx) for whichever chain
      the demo targets — the forwarder addresses are confirmed, this one
      is left to pick at demo time since it's inherently per-deployment.
- [x] ~~Real amount values in each `workflow.ts`~~ — resolved, not with a
      "Math node" (there isn't one — checked the real repo source,
      `lib/workflow/nodes/`, and no such node exists; the closest thing is
      the `code/run-code` plugin, a sandboxed JS step whose `config.code`
      string supports the same `{{@nodeId:Label.field}}` references,
      confirmed via `lib/workflow/executor/executor.workflow.ts`'s
      `processCodeTemplates`). Turned out neither workflow actually needed
      it:
      - **Aave repay** now uses `MAX_UINT256` (confirmed against
        docs.keeperhub.com/plugins/aave-v3: "Use type(uint256).max as
        amount to repay the entire debt") instead of a computed partial
        amount — also the safer choice for a guardian, since a partial
        repay could undershoot before the next scheduled run.
      - **Pendle redeem/mint** now reads the real PT/SY balances first
        (`get-pt-balance` / `get-sy-balance`, both confirmed against
        docs.keeperhub.com/plugins/pendle: input `account`, output
        `balance`) and feeds them into `netPyIn`/`netSyIn` via
        `templateRef()`, instead of guessing an amount. `minSyOut`/
        `minPyOut` stay `'0'` deliberately — documented inline in
        `workflow.ts` why that's a choice, not a placeholder.

## Left — polish

- [ ] Nothing currently — `/workflow`, `/proof`, and the AeroShards
      cleanup were finished in a later pass than the note that used to be
      here.

## Bounty track — Best KeeperHub Feature ($1,000, two $500 winners)

Reviewed the repo's open issues/PRs directly (`gh issue list` /
`gh pr list`) rather than guessing what's free — most obvious bugs already
have an open PR against them from other hackathon entrants.

**Shipped — two PRs, both open against `KeeperHub/keeperhub`:**

- **[PR #2557](https://github.com/KeeperHub/keeperhub/pull/2557)** — fixes
  **#2305**: a condition config passed as `{ group }` (matching the
  `ConditionConfig` type's own shape, ironically) was silently ignored,
  because the resolver only reads `config.conditionConfig.group`; the
  resulting undefined-condition failure got blamed on the template
  reference instead of the real cause. Root-caused to
  `lib/workflow/editor/sanitize-nodes.ts`'s `normalizeConditionConfig`,
  which dropped a root-level `group` instead of folding it in. Added 2
  tests to `tests/unit/sanitize-nodes.test.ts`.
- **[PR #2558](https://github.com/KeeperHub/keeperhub/pull/2558)** — fixes
  **#2230** ("Add Arc testnet as a supported chain"), and ships mainnet
  alongside it since Arc's mainnet went live mid-hackathon
  (2026-09-16). Chain IDs, RPC URLs, and the USDC contract address
  (`0x3600...0000`, native gas token's optional ERC-20 interface) were all
  verified directly on-chain via raw JSON-RPC calls, not just against
  Circle's docs — a couple of secondary sources reported a conflicting
  chain ID for an unrelated, differently-named "ARC" project, ruled out
  explicitly. Touches `lib/rpc/rpc-config.ts`,
  `scripts/seed/seed-chains.ts`, `scripts/seed/seed-tokens.ts`.

Both were chosen over other open, unclaimed candidates (#2433 Lido
Withdrawal Queue, #2453 Uniswap V3 liquidity actions, #2444 Hoodi network)
deliberately: #2305 required reading the real Condition node source, which
is exactly what unblocked the main-track workflows above — one
investigation, two payoffs. #2230 was flagged as a trending/safe pick and
had a clear, bounded spec (3 files, no plugin/schema changes).

**Left for the bounty track:** neither PR has a DoraHacks BUIDL yet. The
bounty rule requires a separate BUIDL per track (a single BUIDL can only
enter one track) — the PRs existing on GitHub isn't the same as being
submitted. This is the actual remaining blocker, not code.

## Demo strategy (per earlier discussion)

Pick **one** protocol to actually execute for real (Superfluid is the
fastest to stage — wrap + open a stream, no liquidation timing or market
maturity to coordinate). Show the other two as configured-but-untriggered
workflows in the KeeperHub dashboard. Video: problem → three protocols +
why each is a "forgotten maintenance" case → live workflow list → the one
real triggered execution + tx hash → candid "what's unfinished."
