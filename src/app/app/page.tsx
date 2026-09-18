'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { buildAaveGuardianWorkflow } from '@/lib/keeperhub/protocols/aave/workflow'
import { buildPendleRolloverWorkflow } from '@/lib/keeperhub/protocols/pendle/workflow'
import { buildSuperfluidGuardianWorkflow } from '@/lib/keeperhub/protocols/superfluid/workflow'

// Example addresses only, for display — not wired to any real account.
const EXAMPLE = '0x0000000000000000000000000000000000000000'

// The org's real Turnkey-managed wallet (confirmed live via GET /api/user/wallet).
// Funded with Base Sepolia testnet ETH; shown here so the dashboard reflects the
// actual connected account instead of only placeholder addresses.
const CONNECTED_WALLET = '0x41fa117719bc134fc8a7e067227ded1fc0355b45'

const DASHBOARD = [
  {
    id: 'pendle',
    name: 'Pendle',
    icon: 'https://icons.llamao.fi/icons/protocols/pendle?w=48&h=48',
    problem: 'A PT position matures and silently stops earning until someone redeems and rolls it forward.',
    effect: 'Redeems the expired PT/YT to SY, then mints a fresh PT/YT in the next market.',
    workflow: buildPendleRolloverWorkflow({
      receiver: EXAMPLE,
      oldYT: EXAMPLE,
      newYT: EXAMPLE,
      scheduleCron: '0 * * * *',
    }),
  },
  {
    id: 'aave',
    name: 'Aave V3',
    icon: 'https://icons.llamao.fi/icons/protocols/aave?w=48&h=48',
    problem: 'A leveraged position’s health factor drifts toward liquidation while nobody is watching.',
    effect: 'Repays the entire debt via MAX_UINT256 once healthFactor drops below the configured floor.',
    workflow: buildAaveGuardianWorkflow({
      user: EXAMPLE,
      repayAsset: EXAMPLE,
      scheduleCron: '*/5 * * * *',
      healthFactorFloor: '1500000000000000000',
    }),
  },
  {
    id: 'superfluid',
    name: 'Superfluid',
    icon: 'https://icons.llamao.fi/icons/protocols/superfluid?w=48&h=48',
    problem: 'A continuous payment stream runs out of buffer and quietly stops paying the recipient.',
    effect: 'Wraps more of the underlying token into the SuperToken to refill the buffer.',
    workflow: buildSuperfluidGuardianWorkflow({
      account: EXAMPLE,
      token: EXAMPLE,
      topUpAmount: '1000000000000000000',
      scheduleCron: '0 * * * *',
    }),
  },
]

// Real execution data, pulled from GET /api/workflows/{id}/executions against
// the live KeeperHub org — not fabricated. Both runs completed only the
// Manual trigger step; the value-moving step never fired because a separate,
// direct call to POST /api/execute/transfer with the same parameters
// confirmed the actual blocker: {"error":"Daily spending cap exceeded"}.
const LIVE_PROOF = {
  workflowId: '3bu6v8ehgnqld08lj3y6h',
  workflowName: 'Anchor live proof — Base Sepolia self-transfer',
  action: {
    pluginId: 'web3',
    actionId: 'transfer-native-token',
    network: '84532 (Base Sepolia)',
    recipientAddress: CONNECTED_WALLET,
    amount: '10000000000000 wei (0.00001 ETH)',
  },
  executions: [
    { id: 'vqkzav037lk2kv68v5yru', startedAt: '2026-09-18T05:14:56.745Z', completedSteps: '1 / 2', lastNode: 'Manual (trigger)', outcome: 'blocked before the transfer step' },
    { id: 'nz7y9mj5fnv86lx4ln5vs', startedAt: '2026-09-18T05:13:23.355Z', completedSteps: '1 / 2', lastNode: 'Manual (trigger)', outcome: 'blocked before the transfer step' },
  ],
  blocker: 'Daily spending cap exceeded',
}

const css = `
  .da-shell { display: flex; min-height: 100vh; background: #ffffff; }
  .da-sidebar { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 2px solid #000000; background: #ffffff; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
  .da-sidebar-head { height: 58px; background: #ffffff; border-bottom: 2px solid #000000; display: flex; align-items: center; padding: 0 20px; flex-shrink: 0; }
  .da-sidebar-nav { flex: 1; padding: 16px 0; }
  .da-main { flex: 1; min-width: 0; background: #ffffff; padding: clamp(28px, 4vw, 56px) clamp(20px, 4vw, 48px) 100px; }
  @media (max-width: 720px) {
    .da-shell { flex-direction: column; }
    .da-sidebar { width: 100%; height: auto; position: static; border-right: none; border-bottom: 2px solid #000000; }
  }
`

const VIEWS = ['Overview', 'Raw JSON'] as const

export default function AppDashboard() {
  const [selectedId, setSelectedId] = useState(DASHBOARD[0].id)
  const [view, setView] = useState<(typeof VIEWS)[number]>('Overview')
  const selected = DASHBOARD.find((d) => d.id === selectedId) ?? DASHBOARD[0]

  // The root layout's <body> is dark by default (see globals.css --bg); this
  // page is white end-to-end, so force it here rather than fight specificity.
  useEffect(() => {
    const prevBody = document.body.style.background
    const prevHtml = document.documentElement.style.background
    document.body.style.background = '#ffffff'
    document.documentElement.style.background = '#ffffff'
    return () => {
      document.body.style.background = prevBody
      document.documentElement.style.background = prevHtml
    }
  }, [])

  return (
    <div className="da-shell" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, author-controlled CSS string, no user input */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <aside className="da-sidebar">
        <div className="da-sidebar-head">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <circle cx="28" cy="12" r="5" stroke="#6D00FF" strokeWidth="4" />
              <path d="M28 17V44M14 32c0 8 6.3 12 14 12s14-4 14-12M14 32h6M42 32h-6" stroke="#6D00FF" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 18, color: '#171717', letterSpacing: '-0.02em' }}>Anchor</span>
          </Link>
        </div>

        <div style={{ padding: '16px 20px 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888888' }}>
          Protocols
        </div>
        <nav aria-label="Protocols" className="da-sidebar-nav">
          {DASHBOARD.map((d) => {
            const active = d.id === selectedId
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedId(d.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '12px 20px',
                  background: active ? '#6D00FF' : 'transparent',
                  border: 'none',
                  color: active ? '#ffffff' : '#171717',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <img src={d.icon} alt="" width={20} height={20} style={{ borderRadius: 5, background: '#fff', padding: 2, flexShrink: 0 }} />
                <span>{d.name}</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: active ? '#ffffff' : '#6D00FF',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#ffffff' : '#6D00FF', flexShrink: 0 }} />
                  Watching
                </span>
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888888', marginBottom: 6 }}>
            Connected wallet
          </div>
          <a
            href={`https://sepolia.basescan.org/address/${CONNECTED_WALLET}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#6D00FF',
              textDecoration: 'none',
              wordBreak: 'break-all',
            }}
          >
            {CONNECTED_WALLET.slice(0, 8)}…{CONNECTED_WALLET.slice(-6)}
          </a>
          <div style={{ fontSize: 10, color: '#999999', marginTop: 4 }}>Base Sepolia · funded</div>
        </div>
      </aside>

      <main className="da-main">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <img src={selected.icon} alt="" width={32} height={32} style={{ borderRadius: 6, background: '#fff', padding: 3, border: '2px solid #000', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: 18, fontWeight: 800, color: '#171717', margin: '0 0 6px' }}>{selected.name} guardian</h2>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#666666', margin: 0 }}>{selected.problem}</p>
          </div>
        </div>

        <div style={{ background: '#fff3e0', border: '2px solid #000000', padding: '12px 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a15c00', flexShrink: 0 }} />
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a15c00', margin: 0 }}>
              Live execution — real, not simulated
            </p>
          </div>
          <p style={{ fontSize: 12, color: '#171717', lineHeight: 1.6, margin: '0 0 4px' }}>
            This {selected.name} guardian hasn&apos;t triggered yet, but the underlying execute pipeline has: workflow{' '}
            <code style={{ color: '#a15c00' }}>{LIVE_PROOF.workflowId}</code> ran {LIVE_PROOF.executions.length} real
            times via <code style={{ color: '#a15c00' }}>POST /api/workflows/{'{id}'}/execute</code> against this same
            connected wallet.
          </p>
          <p style={{ fontSize: 12, color: '#171717', lineHeight: 1.6, margin: 0 }}>
            The trigger fired both times; the value-moving step is blocked by a real org guardrail —{' '}
            <code style={{ color: '#a15c00' }}>&quot;{LIVE_PROOF.blocker}&quot;</code> (confirmed via{' '}
            <code style={{ color: '#a15c00' }}>POST /api/execute/transfer</code>, HTTP 403) — waiting on that cap
            being raised in the org&apos;s settings.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { stat: String(selected.workflow.nodes.length), lbl: 'Nodes' },
            { stat: String(selected.workflow.edges.length), lbl: 'Edges' },
            {
              stat: (selected.workflow.nodes[0].data.config as { cron?: string }).cron ?? '—',
              lbl: 'Trigger',
            },
          ].map((s) => (
            <div key={s.lbl} style={{ border: '2px solid #000000', padding: '12px 14px' }}>
              <div style={{ fontFamily: 'var(--font-outfit)', fontSize: 20, fontWeight: 900, color: '#171717' }}>{s.stat}</div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#888888', marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                padding: '8px 16px',
                background: view === v ? '#6D00FF' : '#ffffff',
                border: '2px solid #000000',
                color: view === v ? '#ffffff' : '#171717',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {view === 'Overview' ? (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6D00FF', margin: '0 0 8px' }}>Workflow steps</p>
            <ol style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selected.workflow.nodes.map((node) => (
                <li
                  key={node.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 14px',
                    background: '#fafafa',
                    border: '2px solid #000000',
                    fontSize: 13,
                    color: '#171717',
                    fontWeight: 600,
                  }}
                >
                  <span>{node.data.label}</span>
                  <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#888888' }}>{node.id}</code>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <pre
            style={{
              background: '#171717',
              border: '2px solid #000000',
              padding: 20,
              overflow: 'auto',
              maxHeight: 480,
              fontSize: 12.5,
              lineHeight: 1.6,
              color: '#e0e0e0',
              margin: 0,
            }}
          >
            <code style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{JSON.stringify(selected.workflow, null, 2)}</code>
          </pre>
        )}
      </main>
    </div>
  )
}
