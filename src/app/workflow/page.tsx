'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { buildAaveGuardianWorkflow } from '@/lib/keeperhub/protocols/aave/workflow'
import { buildPendleRolloverWorkflow } from '@/lib/keeperhub/protocols/pendle/workflow'
import { buildSuperfluidGuardianWorkflow } from '@/lib/keeperhub/protocols/superfluid/workflow'

// Example addresses only, for display — not wired to any real account.
// Real values (see PLAN.md) get filled in per-deployment, not hardcoded here.
const EXAMPLE = '0x0000000000000000000000000000000000000000'

const WORKFLOWS = [
  {
    id: 'pendle',
    name: 'Pendle PT auto-rollover',
    icon: 'https://icons.llamao.fi/icons/protocols/pendle?w=48&h=48',
    definition: buildPendleRolloverWorkflow({
      receiver: EXAMPLE,
      oldYT: EXAMPLE,
      newYT: EXAMPLE,
      scheduleCron: '0 * * * *',
    }),
  },
  {
    id: 'aave',
    name: 'Aave V3 health-factor guardian',
    icon: 'https://icons.llamao.fi/icons/protocols/aave?w=48&h=48',
    definition: buildAaveGuardianWorkflow({
      user: EXAMPLE,
      repayAsset: EXAMPLE,
      scheduleCron: '*/5 * * * *',
      healthFactorFloor: '1500000000000000000',
    }),
  },
  {
    id: 'superfluid',
    name: 'Superfluid stream guardian',
    icon: 'https://icons.llamao.fi/icons/protocols/superfluid?w=48&h=48',
    definition: buildSuperfluidGuardianWorkflow({
      account: EXAMPLE,
      token: EXAMPLE,
      topUpAmount: '1000000000000000000',
      scheduleCron: '0 * * * *',
    }),
  },
]

export default function WorkflowPage() {
  const [selectedId, setSelectedId] = useState(WORKFLOWS[0].id)
  const selected = WORKFLOWS.find((w) => w.id === selectedId) ?? WORKFLOWS[0]

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
    <div style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', background: '#ffffff', minHeight: '100dvh' }}>
      <header style={{ height: 58, background: '#ffffff', borderBottom: '2px solid #000000', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <circle cx="28" cy="12" r="5" stroke="#6D00FF" strokeWidth="4" />
            <path d="M28 17V44M14 32c0 8 6.3 12 14 12s14-4 14-12M14 32h6M42 32h-6" stroke="#6D00FF" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 18, color: '#171717', letterSpacing: '-0.02em' }}>Anchor</span>
        </Link>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(28px, 4vw, 56px) clamp(20px, 4vw, 40px) 100px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6D00FF', marginBottom: 10 }}>
          Workflow definitions
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-outfit)',
            fontSize: 'clamp(26px, 3vw, 38px)',
            fontWeight: 900,
            color: '#171717',
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}
        >
          The exact graph each protocol runs
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#666666', marginBottom: 32 }}>
          Real node/edge JSON built by the functions in <code style={{ color: '#6D00FF' }}>src/lib/keeperhub/protocols/*/workflow.ts</code>, rendered
          with placeholder addresses. The Condition gate is source-verified against KeeperHub&apos;s own repo, not guessed.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {WORKFLOWS.map((w) => {
            const active = w.id === selectedId
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedId(w.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: active ? '#6D00FF' : '#ffffff',
                  border: '2px solid #000000',
                  color: active ? '#ffffff' : '#171717',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <img src={w.icon} alt="" width={18} height={18} style={{ borderRadius: 4, background: '#fff', padding: 1 }} />
                {w.name}
              </button>
            )
          })}
        </div>

        <pre
          style={{
            background: '#171717',
            border: '2px solid #000000',
            padding: 20,
            overflow: 'auto',
            maxHeight: 560,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: '#e0e0e0',
            margin: 0,
          }}
        >
          <code style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{JSON.stringify(selected.definition, null, 2)}</code>
        </pre>
      </main>
    </div>
  )
}
