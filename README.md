<img src="public/anchor-glyph.svg" width="56" height="56" alt="Anchor" />

# Anchor

**Positions on Pendle, Aave, and Superfluid don't sleep. Powered by [KeeperHub](https://keeperhub.com), neither does their upkeep.**

Built for [KeeperHub — The Agent Economy Hackathon](https://dorahacks.io) (Sep 6–18, 2026), main track: *Best Integration into a Live Project*.

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
risk signal → act → notify.**

- **Pendle** — `is-pt-expired` → `redeem-pt-yt-to-sy` → `mint-pt-yt-from-sy` into the next market.
- **Aave V3** — `getUserAccountData` (watch `healthFactor`) → `repay` before liquidation.
- **Superfluid** — `get-net-flow` → `wrap` more of the underlying to extend a stream's runway.

Every step above is a native KeeperHub plugin action — no custom contract calls.
Value moves through KeeperHub's Turnkey-secured, non-custodial wallet
infrastructure; Anchor's own code only ever reads state and configures/triggers
workflows.

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
  workflows with AI assistance before calling the REST API directly.
- **Org guardrails, discovered live, not documented** — a new org has a
  daily spending cap that blocks any value-moving execution by default
  (confirmed via a real `403 {"error":"Daily spending cap exceeded"}` from
  `/api/execute/transfer`). Raising it is an org **Settings** action, not
  an API call this key's scope can make.

Full done/left tracking, including which contract addresses are real
(pulled from open-source registries) vs. still placeholder, lives in
[`PLAN.md`](./PLAN.md) — kept current as the build progresses rather than
duplicated here.

## Getting started

```bash
npm install
npm run dev
```

Requires a KeeperHub account (signup auto-provisions a non-custodial Turnkey
wallet — see [Getting Started](https://docs.keeperhub.com/getting-started)) and
an API key from **Settings → Developer → API keys**. Copy `.env.example` to
`.env.local` and fill in `KEEPERHUB_API_KEY` plus whichever protocol's
addresses you're targeting.

KeeperHub gives new orgs a monthly sponsored-gas allowance on mainnet, so early
runs don't need the wallet pre-funded for gas — only for whatever value actually
moves.

### MCP (for drafting workflows with AI assistance)

```bash
claude mcp add --transport http --scope user keeperhub https://app.keeperhub.com/mcp \
  --header "Authorization: Bearer kh_your_key_here"
```

## Docs

- Platform overview: https://docs.keeperhub.com/
- Plugin references: https://docs.keeperhub.com/plugins/pendle · `/aave-v3` · `/superfluid`
- MCP server: https://docs.keeperhub.com/ai-tools/mcp-server
- Source: https://github.com/keeperhub/keeperhub
- This hackathon's rules + platform reference, gathered in one place: [`docs/keeperhub-hackathon.md`](./docs/keeperhub-hackathon.md)

## License

MIT
