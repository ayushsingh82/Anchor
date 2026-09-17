import Link from 'next/link'

export default function ProofPage() {
  return (
    <div className="page">
      <header className="page-nav">
        <Link href="/" className="logo">
          Anchor
        </Link>
        <Link href="/" className="page-back">
          ← Home
        </Link>
      </header>

      <main className="page-body">
        <p className="how-label">Proof of execution</p>
        <h1 className="page-title">Not connected yet</h1>
        <p className="page-lead">
          This page is wired to call <code>getWorkflowHistory()</code> from{' '}
          <code>src/lib/keeperhub/client.ts</code> and list real executions —
          trigger, submitted transaction, gas used, outcome, all pulled straight
          from KeeperHub&apos;s own audit trail. There&apos;s no live KeeperHub
          account behind this project yet, so there&apos;s nothing real to show
          here — see{' '}
          <a href="https://github.com/ayushsingh82/Anchor/blob/main/PLAN.md" target="_blank" rel="noreferrer">
            PLAN.md
          </a>{' '}
          for what&apos;s left before that changes.
        </p>
        <div className="proof-placeholder">
          <p>Once a workflow has run at least once, this becomes:</p>
          <ul>
            <li>Trigger event + timestamp</li>
            <li>
              Submitted transaction hash, linked to the explorer
            </li>
            <li>Gas used and outcome</li>
            <li>Full per-step audit log</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
