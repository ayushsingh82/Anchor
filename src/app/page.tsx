'use client'

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
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <header className="nav">
        <a className="logo" href="#">
          Pendle Roller
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="#workflow">Workflow</a>
          <a href="#proof">Proof</a>
        </nav>
        <div className="nav-actions">
          <a className="btn btn-quiet" href="https://docs.keeperhub.com" target="_blank" rel="noreferrer">
            KeeperHub docs
          </a>
          <a className="btn btn-primary" href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
            <ArrowIcon />
          </a>
        </div>
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
        <a href="#workflow" onClick={() => setMenuOpen(false)}>
          Workflow
        </a>
        <a href="#proof" onClick={() => setMenuOpen(false)}>
          Proof
        </a>
        <a href="https://docs.keeperhub.com" target="_blank" rel="noreferrer">
          KeeperHub docs
        </a>
      </nav>

      <div className="hero-inner">
        <p className="eyebrow">Built on KeeperHub · Pendle plugin</p>
        <h1>
          <span className="ln">
            <span className="ln-i">Matures. Rolls.</span>
          </span>
          <span className="ln">
            <span className="ln-i">Automatically.</span>
          </span>
        </h1>
        <p className="hero-sub">
          A Pendle PT position quietly stops earning the moment it matures. This
          workflow checks maturity on a schedule, redeems it, and rolls straight into
          the next cycle — a real onchain transaction, executed through KeeperHub,
          with nobody clicking anything.
        </p>
        <div className="ctas">
          <a className="btn btn-primary" href="#workflow">
            See the workflow
            <ArrowIcon />
          </a>
          <a className="btn btn-ghost" href="#proof">
            View proof of execution
            <ArrowIcon />
          </a>
        </div>
        <div className="proof-row">
          <span>
            <b>KeeperHub</b> execution layer
          </span>
          <span>
            <b>Pendle</b> plugin, native actions
          </span>
          <span>
            <b>0</b> manual steps at maturity
          </span>
        </div>
      </div>
    </div>
  )
}
