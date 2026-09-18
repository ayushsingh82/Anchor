'use client'

import Link from 'next/link'
import { useState } from 'react'
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
  .da-nav { height: 58px; background: #6D00FF; display: flex; align-items: center; padding: 0 32px; }
  .da-grid { display: grid; grid-template-columns: 260px 1fr; gap: 20px; }
  @media (max-width: 720px) {
    .da-grid { grid-template-columns: 1fr; }
  }
`

export default function AppDashboard() {
  const [selectedId, setSelectedId] = useState(DASHBOARD[0].id)
  const selected = DASHBOARD.find((d) => d.id === selectedId) ?? DASHBOARD[0]

  return (
    <div style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', background: '#ffffff', minHeight: '100dvh' }}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, author-controlled CSS string, no user input */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className="da-nav">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <svg width="26" height="26" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <circle cx="28" cy="12" r="5" stroke="#ffffff" strokeWidth="4" />
            <path d="M28 17V44M14 32c0 8 6.3 12 14 12s14-4 14-12M14 32h6M42 32h-6" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 20, color: '#ffffff', letterSpacing: '-0.02em' }}>Anchor</span>
        </Link>
      </nav>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(28px, 4vw, 56px) clamp(20px, 4vw, 40px) 100px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6D00FF', marginBottom: 10 }}>Dashboard</div>
        <h1
          style={{
            fontFamily: 'var(--font-outfit)',
            fontSize: 'clamp(28px, 3.5vw, 44px)',
            fontWeight: 900,
            color: '#171717',
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}
        >
          Every protocol, one place.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#666666', maxWidth: 640, marginBottom: 40 }}>
          Pick a protocol on the left to see its real workflow graph and what actually happens when the Condition
          gate opens.
        </p>

        <div className="da-grid">
          <nav aria-label="Protocols" style={{ background: '#ffffff', border: '2px solid #000000', overflow: 'hidden', alignSelf: 'start' }}>
            <div style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888888', borderBottom: '2px solid #000000' }}>
              Protocols
            </div>
            {DASHBOARD.map((d, i) => {
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
                    padding: '14px 16px',
                    background: active ? '#6D00FF' : '#ffffff',
                    border: 'none',
                    borderTop: i > 0 ? '1px solid #eee' : 'none',
                    color: active ? '#ffffff' : '#171717',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <img src={d.icon} alt="" width={22} height={22} style={{ borderRadius: 5, background: '#fff', padding: 2, flexShrink: 0 }} />
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
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: active ? '#ffffff' : '#6D00FF',
                        flexShrink: 0,
                      }}
                    />
                    Watching
                  </span>
                </button>
              )
            })}
          </nav>

          <div style={{ background: '#ffffff', border: '2px solid #000000', padding: 'clamp(20px, 3vw, 32px)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
              <img src={selected.icon} alt="" width={32} height={32} style={{ borderRadius: 6, background: '#fff', padding: 3, border: '2px solid #000', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: 18, fontWeight: 800, color: '#171717', margin: '0 0 6px' }}>{selected.name} guardian</h2>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#666666', margin: 0 }}>{selected.problem}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
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

            <div style={{ background: '#f8f4ff', border: '2px solid #000000', padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6D00FF', margin: '0 0 8px' }}>The effect</p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#171717', margin: 0 }}>{selected.effect}</p>
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6D00FF', margin: '28px 0 8px' }}>Workflow steps</p>
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

            <p style={{ marginTop: 28, fontSize: 12.5, color: '#888888', lineHeight: 1.6 }}>
              No live execution has run against this workflow yet — see{' '}
              <a href="https://github.com/ayushsingh82/Anchor/blob/main/PLAN.md" target="_blank" rel="noreferrer" style={{ color: '#6D00FF' }}>
                PLAN.md
              </a>{' '}
              for current status, or the full node/edge JSON on the{' '}
              <Link href="/workflow" style={{ color: '#6D00FF' }}>
                workflow page
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
