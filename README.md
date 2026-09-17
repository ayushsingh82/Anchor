# Pendle Roller

**A Pendle PT position that rolls itself forward — executed through [KeeperHub](https://keeperhub.com).**

Built for [KeeperHub — The Agent Economy Hackathon](https://dorahacks.io) (Sep 6–18, 2026), main track: *Best Integration into a Live Project*.

## The problem

[Pendle](https://www.pendle.finance/) splits a yield-bearing asset into a Principal
Token (PT) that matures on a fixed date. The moment it matures, the PT just sits
there — it stops earning yield until someone manually redeems it and rolls into the
next maturity's PT. That's a real, common "forgot the second step" failure: the
transaction that would fix it is fully valid, nobody is assigned to run it, so it
doesn't happen.

## What this does

A KeeperHub workflow that:
1. **Checks** a PT's maturity on a schedule (Pendle plugin, `is-pt-expired`).
2. **Redeems** it back to the underlying (SY) once matured (`redeem-pt-yt-to-sy`).
3. **Rolls** that SY straight into the next market's PT/YT (`mint-pt-yt-from-sy`).
4. **Notifies** once it's done.

All three Pendle steps are KeeperHub's own native plugin actions — no custom
contract calls. Live project on the other side: **Pendle**, a real, widely-used
yield-trading protocol. Value moves through KeeperHub's Turnkey-secured wallet
infrastructure, not ours.

## KeeperHub surfaces used

- **Pendle plugin** (`pluginId: "pendle"`) — `is-pt-expired`, `redeem-pt-yt-to-sy`,
  `mint-pt-yt-from-sy`. See `src/lib/keeperhub/pendle.ts`.
- **REST API** — `POST /api/workflows/create`, `GET /api/workflows`,
  `GET /api/workflows/{id}/history`. `Authorization: Bearer kh_...`. See
  `src/lib/keeperhub/client.ts`.
- **MCP server** — `https://app.keeperhub.com/mcp`, used to draft and validate the
  workflow via `ai_generate_workflow` / `validate_workflow` before creating it for
  real (see "Status" below for why).

## Status — what's confirmed vs. what isn't yet

Built by reading `docs.keeperhub.com` directly rather than guessing:

- ✅ Workflow schema (`nodes`/`edges`, trigger types, action node shape)
- ✅ Pendle plugin's exact action IDs and config fields for redeem/mint
- ✅ API auth header format and the create/list/history endpoints
- ✅ MCP server install command and its tool list
- ⚠️ **Not yet confirmed**: the exact JSON shape for a Condition/branch node
  (gating "redeem + mint" on "is expired"), and the exact output-reference
  template syntax between nodes — both 404'd when checked against the docs
  directly. Plan: use KeeperHub's own `ai_generate_workflow` MCP tool to draft
  this part correctly (describe it in plain English, it assembles a valid graph),
  then `validate_workflow` before ever calling `create_workflow` for real.
- ⚠️ No live KeeperHub account/API key wired in yet — `src/lib/keeperhub/*` is
  written against the documented API shape but untested against a real
  organization. Needed before we have a real proof-of-execution transaction.

## Getting started

```bash
npm install
npm run dev
```

Requires a KeeperHub account (signup auto-provisions a non-custodial Turnkey
wallet — see [Getting Started](https://docs.keeperhub.com/getting-started)) and
an API key from **Settings → Developer → API keys**. Copy `.env.example` to
`.env.local` and fill in `KEEPERHUB_API_KEY` plus the target Pendle market's
`YT` addresses.

KeeperHub gives new orgs a monthly sponsored-gas allowance on mainnet, so early
runs don't need the wallet pre-funded for gas — only for whatever value actually
moves.

### MCP (for drafting the workflow with AI assistance)

```bash
claude mcp add --transport http --scope user keeperhub https://app.keeperhub.com/mcp \
  --header "Authorization: Bearer kh_your_key_here"
```

## Project structure

```
src/
├── app/
│   ├── page.tsx              Landing page
│   └── globals.css           Design tokens + entrance animation
└── lib/keeperhub/
    ├── types.ts               Workflow/node/edge types
    ├── client.ts               REST API client (auth, create/list/history)
    ├── pendle.ts                Pendle plugin action IDs + config shapes
    └── workflows/
        └── pendle-rollover.ts   Draft workflow definition (see Status above)
```

## Docs

- Platform overview: https://docs.keeperhub.com/
- Pendle plugin reference: https://docs.keeperhub.com/plugins/pendle
- MCP server: https://docs.keeperhub.com/ai-tools/mcp-server
- Source: https://github.com/keeperhub/keeperhub

## License

MIT
