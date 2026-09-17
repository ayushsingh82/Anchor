import Link from 'next/link'
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
    definition: buildSuperfluidGuardianWorkflow({
      account: EXAMPLE,
      token: EXAMPLE,
      topUpAmount: '1000000000000000000',
      scheduleCron: '0 * * * *',
    }),
  },
]

export default function WorkflowPage() {
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
        <p className="how-label">Workflow definitions</p>
        <h1 className="page-title">The exact graph each protocol runs</h1>
        <p className="page-lead">
          Real node/edge JSON built by the functions in{' '}
          <code>src/lib/keeperhub/protocols/*/workflow.ts</code>, rendered with
          placeholder addresses. The condition/branch node between the check and
          the action is still an open item — see{' '}
          <a href="https://github.com/ayushsingh82/Anchor/blob/main/PLAN.md" target="_blank" rel="noreferrer">
            PLAN.md
          </a>
          .
        </p>

        {WORKFLOWS.map((w) => (
          <section key={w.id} className="workflow-block">
            <h2>{w.name}</h2>
            <pre className="workflow-json">
              <code>{JSON.stringify(w.definition, null, 2)}</code>
            </pre>
          </section>
        ))}
      </main>
    </div>
  )
}
