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
per KeeperHub's own plugin docs; confirmed against Etherscan):
- CFAv1Forwarder: `0xcfA132E353cB4E398080B9700609bb008eceB125`
- GDAv1Forwarder: not yet confirmed — the metadata source checked was stale
  (only had an old Base Goerli testnet entry). Needs a fresh lookup against
  `docs.superfluid.org/docs/protocol/contract-addresses` or the Superfluid
  Explorer directly (both are JS-rendered, couldn't be scraped by the fetch
  tool available in this session — needs a browser, not automated fetch).
- No specific SuperToken (e.g. USDCx on Base) address confirmed yet — per
  the plugin docs this is "user-provided" per workflow anyway, so it can be
  picked directly in the KeeperHub app rather than hardcoded here.

**Pendle** — not yet gathered. Unlike Aave/Superfluid, Pendle markets
expire and get replaced regularly, so a hardcoded address would go stale;
the right move is picking a live, currently-active market directly from
[app.pendle.finance](https://app.pendle.finance) at build/demo time rather
than baking one into this repo now.

## Left — before this can execute anything real

- [ ] **Condition/branch node JSON shape** — still unconfirmed across all
      three workflows (404'd when checked directly against the docs both
      times). Plan unchanged: draft it once via KeeperHub's AI canvas
      (`ai_generate_workflow` MCP tool) from a plain-English description,
      then reconcile the exported JSON into these files instead of guessing.
- [ ] **No live KeeperHub account/API key wired in.** Everything in
      `src/lib/keeperhub/` is written against the documented API shape but
      has never been run against a real organization. This is the actual
      blocker for the submission's required "link to a transaction executed
      through KeeperHub."
- [ ] **Pendle market + YT addresses** for both the expiring and next
      market — pick these live from app.pendle.finance right before the
      demo, not now (see above).
- [ ] **Superfluid GDAv1Forwarder address + a concrete SuperToken address**
      for whichever chain the demo targets.
- [ ] **Amount/threshold math** in each `workflow.ts` (marked inline) —
      currently placeholder `'0'` values; needs the reference/template
      syntax (also unconfirmed, see above) to compute "repay just enough"
      / "wrap enough to cover N hours" from a prior node's output.

## Left — polish

- [ ] `/workflow` and `/proof` routes are linked from the nav/footer but
      don't exist yet (`src/app/workflow`, `src/app/proof`) — currently
      404. `/proof` should call `getWorkflowHistory()` once a real workflow
      exists; needs a graceful "not connected yet" state until then.
- [ ] `src/components/AeroShards.tsx` (a vendored WebGPU background effect,
      `vgpu` dependency) is installed but no longer used on the page — it
      was pulled from the header after visual issues neither of us could
      verify without a real browser. Either wire it in somewhere it can
      actually be checked, or remove it and the `vgpu` dependency to avoid
      shipping dead weight.

## Demo strategy (per earlier discussion)

Pick **one** protocol to actually execute for real (Superfluid is the
fastest to stage — wrap + open a stream, no liquidation timing or market
maturity to coordinate). Show the other two as configured-but-untriggered
workflows in the KeeperHub dashboard. Video: problem → three protocols +
why each is a "forgotten maintenance" case → live workflow list → the one
real triggered execution + tx hash → candid "what's unfinished."
