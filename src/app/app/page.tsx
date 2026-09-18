'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CONNECTED_WALLET, LIVE_PROOF } from '@/lib/keeperhub/live-proof'
import { buildAaveGuardianWorkflow } from '@/lib/keeperhub/protocols/aave/workflow'
import { buildPendleRolloverWorkflow } from '@/lib/keeperhub/protocols/pendle/workflow'
import { buildSuperfluidGuardianWorkflow } from '@/lib/keeperhub/protocols/superfluid/workflow'

// Example addresses only, for display — not wired to any real account.
const EXAMPLE = '0x0000000000000000000000000000000000000000'

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

const css = `
  .da-shell { display: flex; height: 100vh; background: #ffffff; overflow: hidden; }
  .da-sidebar { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 2px solid #000000; background: #ffffff; height: 100vh; overflow: hidden; }
  .da-sidebar-head { height: 58px; background: #ffffff; border-bottom: 2px solid #000000; display: flex; align-items: center; padding: 0 20px; flex-shrink: 0; }
  .da-sidebar-nav { flex: 1; padding: 16px 0; }
  .da-content { flex: 1; min-width: 0; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; }
  .da-main { flex: 1; background: #ffffff; padding: clamp(28px, 4vw, 56px) clamp(20px, 4vw, 48px) 0; }
  .da-footer { border-top: 2px solid #000000; padding: 24px clamp(20px, 4vw, 48px); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  @media (max-width: 720px) {
    .da-shell { flex-direction: column; height: auto; overflow: visible; }
    .da-sidebar { width: 100%; height: auto; border-right: none; border-bottom: 2px solid #000000; }
    .da-content { height: auto; overflow: visible; }
  }
`

const VIEWS = ['Overview', 'Raw JSON'] as const

export default function AppDashboard() {
  const [selectedId, setSelectedId] = useState(DASHBOARD[0].id)
  const [view, setView] = useState<(typeof VIEWS)[number]>('Overview')
  const [openTx, setOpenTx] = useState<(typeof LIVE_PROOF.transactions)[number] | null>(null)
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

      <div className="da-content">
      <main className="da-main">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <img src={selected.icon} alt="" width={32} height={32} style={{ borderRadius: 6, background: '#fff', padding: 3, border: '2px solid #000', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: 18, fontWeight: 800, color: '#171717', margin: '0 0 6px' }}>{selected.name} guardian</h2>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#666666', margin: 0 }}>{selected.problem}</p>
          </div>
        </div>

        <div style={{ background: '#e8f9ee', border: '2px solid #000000', padding: '24px 28px', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a7a3f', flexShrink: 0 }} />
            <p style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1a7a3f', margin: 0, fontFamily: 'var(--font-outfit)' }}>
              Live execution — {LIVE_PROOF.transactions.length} real transactions confirmed
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, marginTop: 14 }}>
            {LIVE_PROOF.transactions.map((tx) => (
              <div key={tx.transactionHash} style={{ background: '#ffffff', border: '2px solid #000000', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Execution ID</span>
                  <code style={{ fontSize: 12, fontWeight: 700, color: '#171717' }}>{tx.executionId}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#666666' }}>Amount</span>
                  <span style={{ fontSize: 12, color: '#171717', fontWeight: 700 }}>{tx.amountEth} ETH · Base Sepolia</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#666666' }}>Transaction hash</span>
                  <a
                    href={tx.transactionLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: '#1a7a3f', fontWeight: 700, fontFamily: 'monospace' }}
                  >
                    {tx.transactionHash.slice(0, 12)}…{tx.transactionHash.slice(-8)} ↗
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenTx(tx)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderTop: '1px solid #eee',
                    paddingTop: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#6D00FF',
                    cursor: 'pointer',
                  }}
                >
                  What does this transaction do? →
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff3e0', border: '2px solid #000000', padding: '14px 18px', marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#a15c00', margin: '0 0 8px' }}>
              Deliberate refusal — the guardrail works both ways
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#666666' }}>Attempted amount</span>
              <span style={{ fontSize: 12, color: '#171717', fontWeight: 700 }}>{LIVE_PROOF.refusal.attemptedAmountEth} ETH (&gt;10× the 0.09 ETH cap)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#666666' }}>Result</span>
              <span style={{ fontSize: 12, color: '#a15c00', fontWeight: 700 }}>refused — &quot;{LIVE_PROOF.refusal.error}&quot;</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '2px solid #000000', padding: '14px 18px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#666666', margin: '0 0 8px' }}>
              Real protocol-specific read — Aave V3, Base mainnet
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#666666' }}>Action</span>
              <code style={{ fontSize: 12, color: '#1a7a3f', fontWeight: 700 }}>{LIVE_PROOF.aaveRead.actionType}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#666666' }}>Total collateral</span>
              <span style={{ fontSize: 12, color: '#171717', fontWeight: 700 }}>{LIVE_PROOF.aaveRead.result.totalCollateralBase}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#666666' }}>Health factor</span>
              <span style={{ fontSize: 12, color: '#171717', fontWeight: 700 }}>{LIVE_PROOF.aaveRead.result.healthFactor}</span>
            </div>
            <a
              href={LIVE_PROOF.aaveRead.poolAddressLink}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11.5, color: '#1a7a3f', fontWeight: 700 }}
            >
              View Aave V3 Pool on Base ↗
            </a>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12, marginBottom: 20, maxWidth: 320 }}>
          {[
            { stat: String(selected.workflow.nodes.length), lbl: 'Nodes' },
            { stat: String(selected.workflow.edges.length), lbl: 'Edges' },
          ].map((s) => (
            <div key={s.lbl} style={{ border: '2px solid #000000', padding: '12px 14px' }}>
              <div style={{ fontFamily: 'var(--font-outfit)', fontSize: 20, fontWeight: 900, color: '#171717' }}>{s.stat}</div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#888888', marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px',
                background: view === v ? '#6D00FF' : '#ffffff',
                border: '2px solid #000000',
                color: view === v ? '#ffffff' : '#171717',
                fontSize: 11,
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
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888', margin: '0 0 6px' }}>Workflow steps</p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selected.workflow.nodes.map((node) => (
                <li
                  key={node.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '6px 10px',
                    background: '#fafafa',
                    border: '1px solid #ddd',
                    fontSize: 11.5,
                    color: '#444444',
                    fontWeight: 500,
                  }}
                >
                  <span>{node.data.label}</span>
                  <code style={{ fontFamily: 'monospace', fontSize: 10, color: '#999999' }}>{node.id}</code>
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

      <footer className="da-footer">
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <circle cx="28" cy="12" r="5" stroke="#6D00FF" strokeWidth="4" />
            <path d="M28 17V44M14 32c0 8 6.3 12 14 12s14-4 14-12M14 32h6M42 32h-6" stroke="#6D00FF" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 15, color: '#171717' }}>Anchor</span>
        </Link>
        <p style={{ fontSize: 12, color: '#888888', margin: 0 }}>
          Positions on Pendle, Aave, and Superfluid don&apos;t sleep. Powered by KeeperHub, neither does their upkeep.
        </p>
        <a href="https://github.com/ayushsingh82/Anchor" target="_blank" rel="noreferrer" style={{ color: '#666666' }} aria-label="Anchor on GitHub">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
        </a>
      </footer>
      </div>

      {openTx && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close"
          onClick={() => setOpenTx(null)}
          onKeyDown={(e) => e.key === 'Escape' && setOpenTx(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              border: '2px solid #000000',
              padding: 28,
              maxWidth: 460,
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: 18, fontWeight: 800, color: '#171717', margin: 0 }}>
                What this transaction is
              </h3>
              <button
                type="button"
                onClick={() => setOpenTx(null)}
                aria-label="Close"
                style={{ background: 'transparent', border: 'none', fontSize: 20, color: '#888888', cursor: 'pointer', lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: 13.5, color: '#171717', lineHeight: 1.7, marginBottom: 16 }}>
              A real KeeperHub-executed self-transfer — {openTx.amountEth} ETH sent from the connected wallet to
              itself on Base Sepolia, via the MCP <code style={{ color: '#6D00FF' }}>execute_transfer</code> tool.
              This isn&apos;t a protocol action (no Aave/Pendle/Superfluid logic runs here) — it exists to prove the
              execution pipeline itself: KeeperHub really does sign and broadcast a transaction from this wallet when
              asked, with a real, independently checkable result.
            </p>
            <div style={{ background: '#fafafa', border: '2px solid #000000', padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#888888', textTransform: 'uppercase', fontWeight: 700 }}>Execution ID</span>
                <code style={{ fontSize: 12, color: '#171717', fontWeight: 700 }}>{openTx.executionId}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#888888', textTransform: 'uppercase', fontWeight: 700 }}>Verified via</span>
                <span style={{ fontSize: 12, color: '#171717', fontWeight: 700 }}>eth_getTransactionReceipt</span>
              </div>
            </div>
            <a
              href={openTx.transactionLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 40,
                padding: '0 20px',
                background: '#6D00FF',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              View on Basescan ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
