# KeeperHub — The Agent Economy Hackathon

**Host:** KeeperHub, via DoraHacks
**Format:** Virtual
**Prize Pool:** $5,000 (paid in stablecoins)

## Timeline

| Milestone | Date |
|---|---|
| Registration opens | ~2026-08-26 to 2026-08-27 |
| Pre-registration | 2026-08-25 15:30 |
| Submission window opens | 2026-09-06 15:30 |
| Office hours (3x, in build window) | 12:00 CEST (UTC+2), dates via Discord |
| **Submission deadline** | **2026-09-18, 12:00 CEST (UTC+2)** — nothing accepted after |
| Judging (repo-level review) | 2026-09-18 → 2026-09-25 |
| Live finalist panel (top 10) | Announced by email within judging window |
| Winners announced | 2026-09-24/25 |

Note: the DoraHacks listing shows the deadline as `2026/09/18 15:30` — the official rules text says `12:00 CEST`. CEST is UTC+2, so 12:00 CEST = 10:00 UTC. Confirm the authoritative time in Discord/the submission form before the deadline.

## Hackathon Tags

Blockchain, AI, Web3, AI Agents, DeFi, Agents, Autonomous, web3 ecosystem, KeeperHub, MCP

## The Theme

KeeperHub executes deterministically, on demand, with full control and an auditable record. Agents are probabilistic; onchain value transfer isn't forgiving of that. KeeperHub removes the reinterpretation risk: an agent composes a workflow through KeeperHub's MCP server, a human reviews it, it can be dry-run without touching the chain, and then that exact workflow executes — nothing is inferred at execution time.

This is KeeperHub's **second** DoraHacks hackathon (after "Agents Onchain": 471 builders, 190 submissions, all reviewed at repo level). This round's brief is narrower and more specific: **integrations**, not standalone demos.

## What to Build

One main track + one bounty:

**Main track — Best Integration into a Live Project.**
Take a project that already exists and is running (real users, a deployed product, or an active protocol) and make KeeperHub the execution layer inside or alongside it. Named examples (not a shortlist — any live project qualifies): Wayfinder, Daydreams, Almanak. The integration must work against the *actual* project, not a generic wrapper. The submission should show KeeperHub executing value movement that the other project triggers, consumes, or benefits from — with proof.

**Bounty — Best KeeperHub Feature.**
KeeperHub is open source. Ship a feature as a PR to the KeeperHub repo — a new chain integration, a new node, a new trigger/action, a connector, or a DX improvement. Judged on whether the KeeperHub team can merge it and build on it.

A single BUIDL can only be entered in one track — to enter both, submit two separate BUIDLs. The bounty stacks with the main track (one project can win both, as two submissions).

## Prizes

| Prize | Amount |
|---|---|
| Total pool | $5,000 |
| **Main track** (ranked, one pool of $4,000) | |
| 1st | $2,000 |
| 2nd | $1,200 |
| 3rd | $800 |
| **Bounty** (two winners) | $500 each ($1,000 total) |

## Judging Criteria

**Main track:**
1. Integration depth — is there a real, named project on the other side, and is the integration specific to it?
2. Execution through KeeperHub — did value actually move through KeeperHub, and is it visible/provable?
3. Reliability and observability — does it survive non-happy-path conditions?
4. Usefulness and originality — does it solve something real for the integrated project's users?
5. Developer experience and code quality — could another team pick this up?

**Bounty:**
1. Mergeability
2. Value to the platform
3. Code quality and tests
4. Scope and completeness

## Submission Requirements

- Source code link (GitHub/GitLab/Bitbucket)
- A short demo video showing the integration actually working
- A link to a transaction executed **through KeeperHub**
- Form answers: which project you integrated with and what the integration does; which KeeperHub surfaces were used (MCP, CLI, x402, MPP, agent-authored workflows, audit trail); testnet or mainnet; what's still broken/unfinished (candor is explicitly welcomed); a reachable contact (email + X or Discord handle)

Incomplete submissions cannot be judged.

## Eligibility

- Worldwide, solo or teams, 18+
- Excludes residents/physical location in OFAC-restricted/sanctioned jurisdictions (residence and physical location, not citizenship alone)
- Every submission must incorporate KeeperHub

## KeeperHub Platform — What It Actually Is

(From [docs.keeperhub.com](https://docs.keeperhub.com/))

KeeperHub is an execution and reliability layer for AI agents operating onchain: visual (or AI-generated) workflows that monitor onchain state, execute transactions, and send notifications, without the builder managing infrastructure. It handles gas estimation, nonce management, transaction ordering, retries, and non-custodial wallet security (via Turnkey) under the hood.

**Workflow model:** every workflow is `trigger → actions → conditions/branches`.

- **Triggers:** Manual, Schedule (recurring interval), Webhook (external HTTP call), Event (a specific onchain contract event), Block (regular block interval on a chain), Transfer (payment arrives at a watched address).
- **Actions:**
  - *Web3* — check balances, read/write contracts, transfer native/ERC-20 tokens, query event logs, decode calldata
  - *Notifications* — Discord, Slack, Telegram, SendGrid email
  - *System* — HTTP requests, conditional branching, For Each loops, Collect (aggregation), template rendering
  - *Math* — sum, count, average, median, min, max, product
- **Conditions/branching:** gate expensive steps behind threshold checks, route by severity, skip on unchanged data.
- **Data flow:** any node can reference any prior step's output (e.g. read a balance → compare in the next node → include the exact value in a notification).
- **Failure handling:** configurable retries; failed runs logged with full error context in the Runs panel.

**Chains:** Ethereum, Base, Arbitrum, Polygon, Sepolia, + other EVM chains (chain-specific gas defaults applied automatically; live list at `GET /api/chains`). Solana mainnet/devnet supported for native SOL + SPL transfers (same Turnkey wallet holds both an EVM and a Solana address); contract calls/protocol plugins/dry-runs are EVM-only today.

**Wallets:** every account gets a Turnkey wallet — hardware-backed key storage, private keys generated/stored inside secure enclaves, never leaving the hardware boundary. Write ops (transfers, contract calls) go through this wallet; read-only actions don't need one.

**AI angles relevant to this hackathon:**
- *AI-assisted workflow generation* — describe an automation in plain language via the canvas's AI prompt; it drafts triggers/actions/conditions for review before enabling.
- *MCP server* — exposes workflow creation/execution as tools for AI agents, so an agent can autonomously build, trigger, and monitor blockchain automations via the Model Context Protocol. **This is the core mechanism the hackathon's "agent economy" framing is about** — KeeperHub as the execution layer an agent delegates onchain actions to.
- *Code optional* — REST API available for programmatic create/update/trigger/monitor from your own tooling/CI.

**Entry points for this hackathon** (all provision a Turnkey wallet automatically on signup):
- Browser (visual builder)
- Agent / MCP (`docs.keeperhub.com/ai-tools/mcp-server`) — most relevant for the "agent-authored workflows" angle the submission form asks about
- API (`docs.keeperhub.com/api`)
- CLI (`docs.keeperhub.com/cli`)

Note: eligible EVM transactions may qualify for KeeperHub's monthly gas sponsorship (network fees only, conditions apply — network, routing, mempool path, credits); any actual value/tokens transferred still needs to be funded separately.

## Support & Docs

- Docs: https://docs.keeperhub.com/
- MCP server guide: https://docs.keeperhub.com/ai-tools/mcp-server
- Source (for the bounty track): https://github.com/keeperhub/keeperhub
- Discord (builder channel + office hours): https://discord.gg/keeperhub
- Link tree (everything else): https://keeperhub.com/links

---

© 2026 DoraHacks / KeeperHub
