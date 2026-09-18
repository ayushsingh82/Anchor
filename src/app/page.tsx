'use client'

import { useState, useRef, useCallback } from 'react'

// ── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  .an-use-cases { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .an-base-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .an-steps { display: grid; grid-template-columns: repeat(4,1fr); border: 2px solid #000; }
  .an-step { border-right: 2px solid #000; padding: 44px 32px 48px; display: flex; flex-direction: column; }
  .an-step:last-child { border-right: none; }
  .an-section { padding: 88px 40px; }
  .an-section-inner { max-width: 1120px; margin: 0 auto; }
  .an-nav { position: fixed; inset: 0 0 auto; height: 58px; z-index: 100; background: #ffffff; display: flex; align-items: center; padding: 0 32px; }
  .an-hero { margin-top: 58px; background: #ffffff; padding: 96px 40px 88px; position: relative; overflow: hidden; }
  .an-hero-badge { display: inline-flex; align-items: center; gap: 8px; height: 28px; padding: 0 14px; background: #fff; color: #6D00FF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 36px; flex-wrap: wrap; }
  .an-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .an-hero-btn { height: 52px; padding: 0 36px; font-size: 15px; font-weight: 800; cursor: pointer; }
  .an-cmp-row { display: grid; grid-template-columns: 1fr 1fr; border-top: 1.5px solid #e8e8e8; }
  .an-cmp-cell { padding: 20px 28px; display: flex; align-items: center; gap: 12px; }
  .an-footer { background: #fff; padding: 28px 36px; border-top: 1.5px solid rgba(109,0,255,0.1); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }

  @keyframes anFloat {
    0%   { transform: translateY(0px) rotate(-2deg); }
    50%  { transform: translateY(-22px) rotate(2deg); }
    100% { transform: translateY(0px) rotate(-2deg); }
  }
  @keyframes anFloatSlow {
    0%   { transform: translateY(0px) rotate(3deg); }
    50%  { transform: translateY(-14px) rotate(-1deg); }
    100% { transform: translateY(0px) rotate(3deg); }
  }
  @keyframes anFloatMed {
    0%   { transform: translateY(-8px) rotate(0deg); }
    50%  { transform: translateY(8px) rotate(4deg); }
    100% { transform: translateY(-8px) rotate(0deg); }
  }
  .an-coin-1 { animation: anFloat 4.2s ease-in-out infinite; }
  .an-coin-2 { animation: anFloatSlow 5.8s ease-in-out infinite 0.9s; }
  .an-coin-3 { animation: anFloatMed 3.6s ease-in-out infinite 0.4s; }

  @keyframes anScan {
    0%   { top: 14%; opacity: 1; }
    90%  { top: 82%; opacity: 1; }
    100% { top: 82%; opacity: 0; }
  }
  .an-scan-beam { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #6D00FF, transparent); animation: anScan 2.4s ease-in-out infinite; }

  @keyframes anPulse {
    0%   { transform: scale(1);   opacity: 0.7; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  .an-pulse { animation: anPulse 1.8s ease-out infinite; }
  .an-pulse2 { animation: anPulse 1.8s ease-out infinite 0.9s; }

  @keyframes anStar {
    0%   { opacity: 0.92; transform: translate(-50%,-50%) scale(1); }
    100% { opacity: 0;    transform: translate(-50%,-80%) scale(0.2); }
  }

  @media (max-width: 900px) {
    .an-steps { grid-template-columns: repeat(2,1fr); }
    .an-step:nth-child(2) { border-right: none; }
    .an-step:nth-child(3) { border-top: 2px solid #000; border-right: 2px solid #000; }
    .an-step:nth-child(4) { border-top: 2px solid #000; border-right: none; }
    .an-base-stats { grid-template-columns: repeat(2,1fr); }
    .an-section { padding: 64px 28px; }
    .an-gate-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
    .an-use-cases { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .an-nav { padding: 0 16px; }
    .an-hero { padding: 64px 20px 56px; }
    .an-hero-badge { font-size: 10px; letter-spacing: 0.08em; height: auto; padding: 6px 10px; }
    .an-hero-btns { flex-direction: column; align-items: stretch; width: 100%; }
    .an-hero-btn { width: 100%; padding: 0 20px; }
    .an-steps { grid-template-columns: 1fr; }
    .an-step { border-right: none !important; border-bottom: 2px solid #000; padding: 28px 20px 32px; }
    .an-step:last-child { border-bottom: none; }
    .an-use-cases { grid-template-columns: 1fr; }
    .an-base-stats { grid-template-columns: 1fr 1fr; }
    .an-section { padding: 48px 20px; }
    .an-cmp-row { grid-template-columns: 1fr 1fr; }
    .an-cmp-cell { padding: 14px 12px; gap: 6px; }
    .an-footer { padding: 24px 20px; flex-direction: column; align-items: flex-start; gap: 12px; }
    .an-footer-copy { order: 3; font-size: 11px !important; }
    .an-gate-row { flex-direction: column !important; gap: 20px !important; align-items: center !important; }
    .an-gate-arrow { padding-bottom: 0 !important; transform: rotate(90deg); font-size: 20px !important; }
  }
`

const PROTOCOL_ICONS = {
  pendle: 'https://icons.llamao.fi/icons/protocols/pendle?w=48&h=48',
  aave: 'https://icons.llamao.fi/icons/protocols/aave?w=48&h=48',
  superfluid: 'https://icons.llamao.fi/icons/protocols/superfluid?w=48&h=48',
}

// ── Anchor glyph ─────────────────────────────────────────────────────────────
function AnchorGlyph({ color = '#ffffff', size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="12" r="5" stroke={color} strokeWidth="4" />
      <path
        d="M28 17V44M14 32c0 8 6.3 12 14 12s14-4 14-12M14 32h6M42 32h-6"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SignalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 12v-3M6 12V6M10 12V3M14 12V8" stroke="#6D00FF" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.6" stroke="#6D00FF" strokeWidth="1.6" />
      <path
        d="M8 1.5v1.6M8 12.9v1.6M14.5 8h-1.6M3.1 8H1.5M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7 3.6 3.6"
        stroke="#6D00FF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5 6.2 12 13 4" stroke="#6D00FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GitHubIcon({ color = '#333333' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={color} aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

// ── The Condition Gate showcase section ──────────────────────────────────────
function GateSection() {
  return (
    <section className="an-section" style={{ background: '#ffffff' }}>
      <div className="an-section-inner">
        <div className="an-gate-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div
            className="an-gate-row"
            style={{
              display: 'flex',
              gap: 24,
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              background: '#f8f4ff',
              border: '2px solid #000000',
              padding: '32px 24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: 10 }}>Schedule</div>
              <div
                style={{
                  width: 130,
                  height: 150,
                  maxWidth: '100%',
                  background: '#1e1e1e',
                  border: '2px solid #333',
                  padding: '18px 14px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 8 }}>⏱</div>
                <div style={{ fontSize: 10, color: '#ccc', fontFamily: 'monospace' }}>*/5 * * * *</div>
                <div style={{ fontSize: 9, color: '#888', marginTop: 4 }}>fires on cron</div>
              </div>
            </div>

            <div className="an-gate-arrow" style={{ color: '#6D00FF', fontSize: 28, fontWeight: 200 }}>
              →
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: 10 }}>
                Condition Gate
              </div>
              <div
                style={{
                  width: 130,
                  maxWidth: '100%',
                  height: 150,
                  background: '#0a0a0a',
                  border: '3px solid #333',
                  borderRadius: 12,
                  padding: '10px 8px 8px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                  {[
                    ['0', '0'],
                    ['auto', '0'],
                    ['0', 'auto'],
                    ['auto', 'auto'],
                  ].map(([t, b], i) => (
                    <div
                      key={`${t}-${b}`}
                      style={{
                        position: 'absolute',
                        top: t === '0' ? 8 : undefined,
                        bottom: b === '0' ? 8 : undefined,
                        left: i < 2 ? 8 : undefined,
                        right: i >= 2 ? 8 : undefined,
                        width: 14,
                        height: 14,
                        borderTop: i === 0 || i === 2 ? '2.5px solid #6D00FF' : undefined,
                        borderBottom: i === 1 || i === 3 ? '2.5px solid #6D00FF' : undefined,
                        borderLeft: i === 0 || i === 1 ? '2.5px solid #6D00FF' : undefined,
                        borderRight: i === 2 || i === 3 ? '2.5px solid #6D00FF' : undefined,
                      }}
                    />
                  ))}
                  <div className="an-scan-beam" />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 10, color: '#ffffff', fontFamily: 'monospace', fontWeight: 700, textAlign: 'center' }}>
                    healthFactor
                    <br />
                    {'< 1.5e18'}
                  </div>
                </div>
                <div style={{ marginTop: 6, padding: '4px 6px', background: '#111', borderRadius: 4 }}>
                  <div style={{ fontSize: 8, color: '#ffffff', fontWeight: 700, textAlign: 'center' }}>EVALUATING…</div>
                </div>
              </div>
            </div>

            <div style={{ color: '#6D00FF', fontSize: 28, fontWeight: 200 }}>→</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: 10 }}>On-Chain</div>
              <div
                style={{
                  width: 130,
                  height: 150,
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  background: '#0a2e1a',
                  border: '2px solid #1a5c35',
                  padding: '18px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" fill="rgba(74,222,128,0.1)" stroke="#4ade80" strokeWidth="1.5" />
                  <path d="M12 20l6 6 10-12" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#4ade80', fontFamily: 'var(--font-outfit)' }}>Debt repaid</div>
                  <div style={{ fontSize: 9, color: '#2a7a4a', marginTop: 2 }}>via MAX_UINT256</div>
                </div>
                <div style={{ position: 'relative', width: 40, height: 40 }}>
                  <div className="an-pulse" style={{ position: 'absolute', inset: 0, border: '2px solid #4ade80', borderRadius: '50%' }} />
                  <div className="an-pulse2" style={{ position: 'absolute', inset: 0, border: '2px solid #4ade80', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 10, height: 10, background: '#4ade80', borderRadius: '50%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6D00FF', marginBottom: 14 }}>
              The Condition Gate
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(28px, 3.5vw, 46px)',
                fontWeight: 900,
                color: '#171717',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                marginBottom: 20,
              }}
            >
              The gate decides.
              <br />
              <span style={{ color: '#6D00FF' }}>Anchor acts.</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#555555', marginBottom: 32 }}>
              KeeperHub&rsquo;s docs 404&rsquo;d on the Condition node&rsquo;s exact shape, twice. Instead of guessing under
              deadline, we cloned KeeperHub&rsquo;s own source and read{' '}
              <code style={{ fontFamily: 'monospace', color: '#4ade80', fontSize: 13 }}>lib/workflow/nodes/condition/</code>{' '}
              directly — the real config shape and the real{' '}
              <code style={{ fontFamily: 'monospace', color: '#4ade80', fontSize: 13 }}>{'{{@nodeId:Label.field}}'}</code>{' '}
              reference syntax.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              {[
                { Icon: SignalIcon, label: 'Reads a real signal', sub: 'Health factor, PT expiry, net flow rate — pulled live, not guessed' },
                { Icon: GearIcon, label: 'Gate evaluates instantly', sub: 'Confirmed against KeeperHub’s own source, not the docs that 404’d' },
                { Icon: CheckIcon, label: 'Executes through KeeperHub', sub: 'Turnkey-signed, non-custodial, auditable in the dashboard' },
              ].map(({ Icon, label, sub }) => (
                <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      background: '#f8f4ff',
                      border: '1px solid #000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#171717' }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#666666', marginTop: 3, lineHeight: 1.5 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/app"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 48,
                padding: '0 28px',
                background: '#6D00FF',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                gap: 8,
              }}
            >
              See a real workflow →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

const PROTOCOLS = [
  {
    id: 'pendle',
    name: 'Pendle',
    icon: PROTOCOL_ICONS.pendle,
    href: 'https://www.pendle.finance',
    dark: false,
    problem: 'A PT position matures and silently stops earning until someone redeems and rolls it forward.',
    actions: ['is-pt-expired', 'redeem-pt-yt-to-sy', 'mint-pt-yt-from-sy'],
  },
  {
    id: 'aave',
    name: 'Aave',
    icon: PROTOCOL_ICONS.aave,
    href: 'https://aave.com',
    dark: true,
    problem: 'A leveraged position’s health factor drifts toward liquidation while nobody is watching.',
    actions: ['getUserAccountData', 'repay'],
  },
  {
    id: 'superfluid',
    name: 'Superfluid',
    icon: PROTOCOL_ICONS.superfluid,
    href: 'https://www.superfluid.finance',
    dark: false,
    problem: 'A continuous payment stream runs out of buffer and quietly stops paying the recipient.',
    actions: ['get-net-flow', 'wrap'],
  },
]

const STEPS = [
  { num: '01', title: 'Schedule fires', desc: 'A cron-based trigger wakes the workflow on its own — no dashboard to remember to check.' },
  { num: '02', title: 'Read on-chain state', desc: 'A real plugin action reads the live signal: health factor, PT expiry, or net flow rate. No cached data.' },
  { num: '03', title: 'Condition gate checks', desc: 'A real Condition node, source-verified against KeeperHub’s own repo, decides whether action is needed.' },
  { num: '04', title: 'Action executes', desc: 'Repay, redeem + mint, or wrap — a real KeeperHub-signed transaction through a non-custodial Turnkey wallet.' },
]

const COMPARE = [
  ['A PT matures, nobody notices', 'Anchor redeems and rolls it forward automatically'],
  ['Health factor drifts toward liquidation unseen', 'Anchor repays before the floor is breached'],
  ['A stream runs dry mid-payment', 'Anchor tops up the buffer before it empties'],
  ['Manual, spreadsheet-tracked maintenance', 'Scheduled, on-chain, auditable execution'],
  ['A one-off script per protocol', 'One agent, one workflow shape, three protocols'],
  ['No proof it happened', 'Every run has a KeeperHub audit trail'],
]

const STEP_STYLES = [
  { bg: '#6D00FF', numColor: 'rgba(255,255,255,0.1)', titleColor: '#ffffff', descColor: 'rgba(255,255,255,0.62)' },
  { bg: '#ffffff', numColor: 'rgba(109,0,255,0.1)', titleColor: '#171717', descColor: '#666666' },
  { bg: '#6D00FF', numColor: 'rgba(255,255,255,0.1)', titleColor: '#ffffff', descColor: 'rgba(255,255,255,0.62)' },
  { bg: '#ffffff', numColor: 'rgba(109,0,255,0.1)', titleColor: '#171717', descColor: '#666666' },
]

// ── Sparkle hero ──────────────────────────────────────────────────────────────
type Particle = { id: number; x: number; y: number; size: number }

function HeroSection() {
  const [particles, setParticles] = useState<Particle[]>([])
  const counter = useRef(0)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const newParticles: Particle[] = Array.from({ length: 4 }, () => ({
      id: counter.current++,
      x: cx + (Math.random() - 0.5) * 24,
      y: cy + (Math.random() - 0.5) * 24,
      size: Math.random() * 6 + 3,
    }))
    setParticles((prev) => [...prev.slice(-120), ...newParticles])
    for (const p of newParticles) {
      setTimeout(() => setParticles((prev) => prev.filter((q) => q.id !== p.id)), 1400)
    }
  }, [])

  return (
    <section onMouseMove={handleMouseMove} className="an-hero">
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: '#6D00FF',
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: 'anStar 1.4s ease-out forwards',
          }}
        />
      ))}

      <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div className="an-hero-badge" style={{ background: '#f8f4ff', color: '#6D00FF', border: '1px solid #000000' }}>
          <AnchorGlyph color="#6D00FF" size={16} />
          Built on KeeperHub
          <span style={{ opacity: 0.5 }}>·</span>
          Pendle · Aave · Superfluid
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-outfit)',
            fontSize: 'clamp(38px, 7vw, 82px)',
            fontWeight: 900,
            fontStyle: 'italic',
            letterSpacing: '-0.04em',
            lineHeight: 1.02,
            color: '#171717',
            maxWidth: 900,
            marginBottom: 28,
          }}
        >
          Positions that
          <br />
          never go stale
          <br />
          <span style={{ color: '#6D00FF' }}>on KeeperHub</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: '#555555',
            maxWidth: 560,
            lineHeight: 1.72,
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          Positions on Pendle, Aave, and Superfluid don&rsquo;t sleep. Powered by KeeperHub, neither does their upkeep.
        </p>

        <div className="an-hero-btns">
          <a
            href="/app"
            className="an-hero-btn"
            style={{
              background: '#6D00FF',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              fontFamily: 'inherit',
            }}
          >
            See the protocols →
          </a>
          <a
            href="https://github.com/ayushsingh82/Anchor"
            target="_blank"
            rel="noreferrer"
            className="an-hero-btn"
            style={{
              background: 'transparent',
              border: '2px solid #000000',
              color: '#171717',
              fontWeight: 700,
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, author-controlled CSS string, no user input */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className="an-nav">
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <AnchorGlyph color="#6D00FF" size={30} />
          <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 20, color: '#171717', letterSpacing: '-0.02em' }}>Anchor</span>
        </span>
        <a
          href="/app"
          style={{
            marginLeft: 'auto',
            height: 34,
            padding: '0 20px',
            background: '#6D00FF',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          Open Dashboard →
        </a>
      </nav>

      <HeroSection />

      <section className="an-section" style={{ background: '#ffffff' }}>
        <div className="an-section-inner">
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6D00FF', marginBottom: 10 }}>How it Works</div>
            <h2
              style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 900,
                color: '#171717',
                letterSpacing: '-0.02em',
              }}
            >
              Four steps. Zero babysitting.
            </h2>
          </div>
          <div className="an-steps">
            {STEPS.map((step, i) => {
              const s = STEP_STYLES[i]
              return (
                <div key={step.num} className="an-step" style={{ background: s.bg }}>
                  <div style={{ fontFamily: 'var(--font-outfit)', fontSize: 52, fontWeight: 900, color: s.numColor, lineHeight: 1, marginBottom: 32 }}>{step.num}</div>
                  <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: 16, fontWeight: 800, color: s.titleColor, marginBottom: 12 }}>{step.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: s.descColor }}>{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <GateSection />

      <section className="an-section" style={{ background: '#f8f4ff' }} id="how">
        <div className="an-section-inner">
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6D00FF', marginBottom: 10 }}>The Three Protocols</div>
            <h2
              style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 900,
                color: '#171717',
                letterSpacing: '-0.02em',
              }}
            >
              One agent, three decays.
            </h2>
          </div>
          <div className="an-use-cases">
            {PROTOCOLS.map((protocol) => (
              <a
                key={protocol.id}
                href={protocol.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: 'clamp(24px, 4vw, 40px)',
                  background: protocol.dark ? '#6D00FF' : '#ffffff',
                  border: protocol.dark ? 'none' : '2px solid #000000',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={protocol.icon} alt="" width={32} height={32} style={{ borderRadius: 8, background: '#fff', padding: 3 }} />
                  <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 18, fontWeight: 800, color: protocol.dark ? '#ffffff' : '#171717' }}>{protocol.name}</span>
                </div>
                <p style={{ fontSize: 'clamp(13px, 1.5vw, 15px)', lineHeight: 1.72, color: protocol.dark ? 'rgba(255,255,255,0.72)' : '#666666', marginBottom: 18 }}>
                  {protocol.problem}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {protocol.actions.map((action) => (
                    <code
                      key={action}
                      style={{
                        fontSize: 11,
                        fontFamily: 'monospace',
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: protocol.dark ? 'rgba(255,255,255,0.12)' : 'rgba(109,0,255,0.08)',
                        color: protocol.dark ? '#ffffff' : '#6D00FF',
                      }}
                    >
                      {action}
                    </code>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="an-section" style={{ background: '#ffffff' }}>
        <div className="an-section-inner">
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6D00FF', marginBottom: 10 }}>Why Anchor</div>
            <h2
              style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 900,
                color: '#171717',
                letterSpacing: '-0.02em',
              }}
            >
              Better than checking a dashboard.
            </h2>
          </div>
          <div style={{ border: '2px solid #000000', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: '14px 20px', background: '#000000', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', borderRight: '2px solid #000' }}>
                Without Anchor
              </div>
              <div style={{ padding: '14px 20px', background: '#6D00FF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)' }}>
                With Anchor
              </div>
            </div>
            {COMPARE.map(([oldWay, newWay]) => (
              <div key={oldWay} className="an-cmp-row">
                <div className="an-cmp-cell" style={{ background: '#fafafa', borderRight: '1.5px solid #e8e8e8' }}>
                  <span style={{ color: '#aaa', fontSize: 12, flexShrink: 0 }}>✕</span>
                  <span style={{ fontSize: 'clamp(12px, 1.4vw, 14px)', color: '#888', lineHeight: 1.5 }}>{oldWay}</span>
                </div>
                <div className="an-cmp-cell">
                  <span style={{ color: '#6D00FF', fontSize: 13, flexShrink: 0, fontWeight: 900 }}>✓</span>
                  <span style={{ fontSize: 'clamp(12px, 1.4vw, 14px)', color: '#171717', fontWeight: 600, lineHeight: 1.5 }}>{newWay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="an-section" style={{ background: '#ffffff' }}>
        <div className="an-section-inner">
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6D00FF', marginBottom: 12 }}>Why KeeperHub</div>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 900, color: '#171717', letterSpacing: '-0.02em', marginBottom: 16 }}>
              Execution you don&rsquo;t have to trust blindly.
            </h2>
          </div>

          <div className="an-base-stats" style={{ marginBottom: 64 }}>
            {[
              { stat: '3', lbl: 'Protocols covered', sub: 'Pendle, Aave V3, Superfluid — one agent' },
              { stat: 'Turnkey', lbl: 'Non-custodial wallet', sub: 'Keys never leave the secure enclave' },
              { stat: 'MCP + REST', lbl: 'Two ways to build', sub: 'Draft with AI, or call the API directly' },
              { stat: 'Source', lbl: 'Everything verified', sub: 'No plugin ID or config shape was guessed' },
            ].map((item) => (
              <div key={item.lbl} style={{ padding: 'clamp(20px, 3vw, 36px)', background: '#ffffff', border: '2px solid #000000' }}>
                <div style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(20px, 2.6vw, 28px)', fontWeight: 900, color: '#171717', marginBottom: 8 }}>{item.stat}</div>
                <div style={{ fontSize: 'clamp(12px, 1.4vw, 15px)', fontWeight: 700, color: '#171717', marginBottom: 4 }}>{item.lbl}</div>
                <div style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', color: '#666666' }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 8, textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(26px, 4vw, 52px)',
                fontWeight: 900,
                fontStyle: 'italic',
                color: '#171717',
                letterSpacing: '-0.03em',
                marginBottom: 16,
              }}
            >
              Built once. Maintained forever.
            </h2>
            <p style={{ fontSize: 'clamp(14px, 1.8vw, 17px)', color: '#666666', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 36px' }}>
              Point Anchor at a Pendle, Aave, or Superfluid position and let KeeperHub keep it upright — no dashboard,
              no reminders, no forgetting.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/app" style={{ height: 54, padding: '0 40px', background: '#6D00FF', color: '#ffffff', fontSize: 15, fontWeight: 800, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                See the protocols →
              </a>
              <a
                href="/proof"
                style={{ height: 54, padding: '0 40px', background: 'transparent', border: '2px solid #000000', color: '#171717', fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
              >
                See the proof
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="an-footer">
        <div>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-outfit)', fontSize: 16, fontWeight: 900, color: '#6D00FF', textDecoration: 'none' }}>
            <AnchorGlyph color="#6D00FF" size={18} />
            Anchor
          </a>
          <div style={{ fontSize: 11, color: '#171717', marginTop: 4 }}>
            Positions on Pendle, Aave, and Superfluid don&rsquo;t sleep. Powered by KeeperHub, neither does their upkeep.
          </div>
        </div>
        <a href="https://github.com/ayushsingh82/Anchor" target="_blank" rel="noreferrer" aria-label="Anchor on GitHub" style={{ color: '#333' }}>
          <GitHubIcon />
        </a>
      </footer>
    </div>
  )
}
