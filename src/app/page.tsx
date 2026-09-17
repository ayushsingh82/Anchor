'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

function ArrowIcon() {
  return (
    <svg className="arw" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
      <path
        d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProtocolBadge({ letter, color }: { letter: string; color: string }) {
  return (
    <span className="protocol-badge" style={{ background: color }} aria-hidden="true">
      {letter}
    </span>
  )
}

/** The Anchor Glyph mark: a ring and two strokes. See /logo for the other five options considered. */
function AnchorGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="12" r="5" stroke="currentColor" strokeWidth="4" />
      <path
        d="M28 17V44M14 32c0 8 6.3 12 14 12s14-4 14-12M14 32h6M42 32h-6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

const PROTOCOLS = [
  {
    id: 'pendle',
    name: 'Pendle',
    color: '#4c6fff',
    href: 'https://www.pendle.finance',
    problem: 'A PT position matures and silently stops earning until someone redeems and rolls it forward.',
    actions: ['is-pt-expired', 'redeem-pt-yt-to-sy', 'mint-pt-yt-from-sy']
  },
  {
    id: 'aave',
    name: 'Aave',
    color: '#2ebac6',
    href: 'https://aave.com',
    problem: 'A leveraged position’s health factor drifts toward liquidation while nobody is watching.',
    actions: ['getUserAccountData', 'repay', 'supply']
  },
  {
    id: 'superfluid',
    name: 'Superfluid',
    color: '#12c2e9',
    href: 'https://www.superfluid.finance',
    problem: 'A continuous payment stream runs out of buffer and quietly stops paying the recipient.',
    actions: ['get-flow', 'update-flow']
  }
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    root.classList.add('anim')
    let started = false

    function start() {
      if (started) return
      started = true
      requestAnimationFrame(() => root.classList.add('go'))
      window.setTimeout(() => {
        root.classList.remove('anim', 'go')
      }, 2200)
    }

    const ceiling = window.setTimeout(start, 900)
    if ('fonts' in document) {
      document.fonts.ready.then(start, start)
    } else {
      start()
    }

    return () => window.clearTimeout(ceiling)
  }, [])

  return (
    <div className="hero">
      <header className="nav">
        <a className="logo" href="#">
          <AnchorGlyph />
          Anchor
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#how">How it works</a>
          <Link href="/workflow">Workflow</Link>
          <Link href="/proof">Proof</Link>
        </nav>
        <button
          className="burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
        </button>
      </header>

      <nav className={`menu${menuOpen ? ' open' : ''}`} id="menu" aria-label="Mobile">
        <a href="#how" onClick={() => setMenuOpen(false)}>
          How it works
        </a>
        <Link href="/workflow" onClick={() => setMenuOpen(false)}>
          Workflow
        </Link>
        <Link href="/proof" onClick={() => setMenuOpen(false)}>
          Proof
        </Link>
        <a href="https://docs.keeperhub.com" target="_blank" rel="noreferrer">
          KeeperHub docs
        </a>
      </nav>

      <div className="hero-inner">
        <p className="eyebrow">
          <span className="dot" aria-hidden="true" />
          Built on KeeperHub · Pendle · Aave · Superfluid
        </p>
        <h1>
          <span className="ln">
            <span className="ln-i">Positions that</span>
          </span>
          <span className="ln">
            <span className="ln-i">
              never go stale<span className="cursor" aria-hidden="true" />
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Positions on Pendle, Aave, and Superfluid don&rsquo;t sleep. Powered by
          KeeperHub, neither does their upkeep.
        </p>
        <div className="ctas">
          <a className="btn btn-primary" href="#how">
            See the protocols
            <ArrowIcon />
          </a>
        </div>
      </div>

      <section className="how" id="how">
        <p className="how-label">How it works</p>
        <h2>One agent, three protocols, the same fix each time.</h2>
        <div className="protocol-grid">
          {PROTOCOLS.map((protocol) => (
            <div className="protocol-card" key={protocol.id}>
              <div className="protocol-card-head">
                <ProtocolBadge letter={protocol.name[0]} color={protocol.color} />
                <a href={protocol.href} target="_blank" rel="noreferrer" className="protocol-name">
                  {protocol.name}
                </a>
              </div>
              <p className="protocol-problem">{protocol.problem}</p>
              <div className="protocol-actions">
                {protocol.actions.map((action) => (
                  <code key={action} className="protocol-action">
                    {action}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-row">
          <span className="logo">Anchor</span>
          <p>Built on KeeperHub for the Agent Economy Hackathon.</p>
        </div>
        <div className="footer-links">
          <Link href="/workflow">Workflow</Link>
          <Link href="/proof">Proof</Link>
          <a href="https://docs.keeperhub.com" target="_blank" rel="noreferrer">
            KeeperHub docs
          </a>
        </div>
      </footer>
    </div>
  )
}
