const ACCENT = '#8b7bff'
const INK = '#f5f5f7'
const PANEL = '#131318'
const LINE = 'rgba(255,255,255,0.1)'

function Mark({ children }: { children: React.ReactNode }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  )
}

/** 1. Literal anchor glyph, reduced to a few strokes. */
function AnchorGlyphMark() {
  return (
    <Mark>
      <circle cx="28" cy="12" r="5" stroke={ACCENT} strokeWidth="2.4" />
      <path
        d="M28 17V44M14 32c0 8 6.3 12 14 12s14-4 14-12M14 32h6M42 32h-6"
        stroke={ACCENT}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </Mark>
  )
}

/** 2. Three nodes on one line -> the "one agent, three protocols" idea. */
function ThreeNodeMark() {
  return (
    <Mark>
      <path d="M12 28H44" stroke={LINE} strokeWidth="2.4" />
      <circle cx="12" cy="28" r="5.5" fill={ACCENT} />
      <circle cx="28" cy="28" r="5.5" stroke={ACCENT} strokeWidth="2.4" fill={PANEL} />
      <circle cx="44" cy="28" r="5.5" stroke={ACCENT} strokeWidth="2.4" fill={PANEL} />
    </Mark>
  )
}

/** 3. Monogram "A" with a chain-link crossbar instead of a straight one. */
function MonogramMark() {
  return (
    <Mark>
      <path d="M16 42 27 12h2l11 30" stroke={ACCENT} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24.5" cy="31" r="3.4" stroke={ACCENT} strokeWidth="2.2" />
      <circle cx="31.5" cy="31" r="3.4" stroke={ACCENT} strokeWidth="2.2" />
    </Mark>
  )
}

/** 4. A gate / bracket shape, referencing the Condition-node "gate" concept. */
function GateMark() {
  return (
    <Mark>
      <path d="M18 14H14a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2h4" stroke={ACCENT} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M38 14h4a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2h-4" stroke={ACCENT} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M23 28h10" stroke={ACCENT} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M29 22v12" stroke={INK} strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
    </Mark>
  )
}

/** 5. Orbit: three small satellites around one core -- protocols orbiting one execution layer. */
function OrbitMark() {
  return (
    <Mark>
      <circle cx="28" cy="28" r="6" fill={ACCENT} />
      <ellipse cx="28" cy="28" rx="18" ry="8" stroke={LINE} strokeWidth="2" />
      <circle cx="10.3" cy="26.3" r="3" fill={ACCENT} />
      <ellipse cx="28" cy="28" rx="8" ry="18" stroke={LINE} strokeWidth="2" transform="rotate(60 28 28)" />
      <circle cx="38.9" cy="12.9" r="3" fill={ACCENT} />
      <ellipse cx="28" cy="28" rx="8" ry="18" stroke={LINE} strokeWidth="2" transform="rotate(120 28 28)" />
      <circle cx="38.9" cy="43.1" r="3" fill={ACCENT} />
    </Mark>
  )
}

/** 6. Anchor reduced to a single hook + baseline -- the "grounding" idea, minimal. */
function HookLineMark() {
  return (
    <Mark>
      <path
        d="M28 10v20M22 16c0-4 12-4 12 0"
        stroke={ACCENT}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M14 46h28" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 30c0 9 16 9 16 0" stroke={ACCENT} strokeWidth="2.6" strokeLinecap="round" />
    </Mark>
  )
}

const PROTOCOL_COLORS = {
  Pendle: '#4c6fff',
  Aave: '#2ebac6',
  Superfluid: '#12c2e9',
} as const

function ProtocolDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Object.entries(PROTOCOL_COLORS).map(([name, color]) => (
        <span
          key={name}
          title={name}
          style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }}
        />
      ))}
    </div>
  )
}

function ProtocolStrip() {
  const names = Object.keys(PROTOCOL_COLORS)
  return (
    <p style={{ fontSize: 11, letterSpacing: '0.06em', color: '#8a8a92', margin: 0 }}>
      {names.map((name, i) => (
        <span key={name}>
          <span style={{ color: PROTOCOL_COLORS[name as keyof typeof PROTOCOL_COLORS] }}>{name.toUpperCase()}</span>
          {i < names.length - 1 && <span style={{ color: '#8a8a92' }}> &middot; </span>}
        </span>
      ))}
    </p>
  )
}

function ProtocolBadges() {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Object.entries(PROTOCOL_COLORS).map(([name, color]) => (
        <span
          key={name}
          title={name}
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            background: color,
            color: '#05050a',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {name[0]}
        </span>
      ))}
    </div>
  )
}

const OPTIONS: Array<{ id: string; name: string; blurb: string; Mark: () => React.ReactNode }> = [
  {
    id: 'anchor-glyph',
    name: 'Anchor Glyph',
    blurb: 'The literal mark, reduced to a ring and two strokes. Most on-the-nose reading of the name.',
    Mark: AnchorGlyphMark,
  },
  {
    id: 'three-node',
    name: 'Three Node',
    blurb: 'One filled node (the agent) tied to two open ones (Pendle, Aave, Superfluid). Reads as the product structure, not the name.',
    Mark: ThreeNodeMark,
  },
  {
    id: 'monogram',
    name: 'Chain-link Monogram',
    blurb: 'An "A" whose crossbar is two linked rings instead of a bar -- works small, as a favicon or app icon.',
    Mark: MonogramMark,
  },
  {
    id: 'gate',
    name: 'Gate',
    blurb: 'References the Condition-node gate every workflow runs through before it acts -- the most "KeeperHub-specific" option.',
    Mark: GateMark,
  },
  {
    id: 'orbit',
    name: 'Orbit',
    blurb: 'Three satellites (the protocols) orbiting one core (the execution layer). Busiest option, reads best at large sizes.',
    Mark: OrbitMark,
  },
  {
    id: 'hook-line',
    name: 'Hook + Line',
    blurb: 'An anchor’s hook sitting on a baseline -- quieter and more abstract than the literal glyph.',
    Mark: HookLineMark,
  },
]

export default function LogoPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: INK,
        padding: '64px 24px 96px',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <p style={{ color: '#8a8a92', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Anchor / logo options
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 600, margin: '0 0 12px' }}>Six directions, not a decision</h1>
        <p style={{ color: '#8a8a92', maxWidth: 620, lineHeight: 1.6, marginBottom: 48 }}>
          All six use the same accent purple and stroke weight so they compare fairly. Each renders as an inline SVG
          mark next to the wordmark, and standalone at favicon size below it.
        </p>

        <p style={{ color: '#8a8a92', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
          Full lockups &mdash; mark + name + the three protocols
        </p>
        <p style={{ color: '#8a8a92', maxWidth: 620, lineHeight: 1.6, marginBottom: 24, fontSize: 14 }}>
          These are complete, ship-ready lockups: the Gate mark (the strongest of the six on its own) paired with
          three ways of surfacing Pendle / Aave / Superfluid, using each protocol&rsquo;s real brand color rather
          than inventing new ones.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 56 }}>
          <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 14, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <GateMark />
              <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>Anchor</span>
            </div>
            <ProtocolStrip />
            <p style={{ fontSize: 12, color: '#8a8a92', marginTop: 16, lineHeight: 1.5 }}>
              <strong style={{ color: INK }}>Text strip.</strong> Reads as a tagline under the wordmark &mdash;
              works in a nav bar, a README header, or a deck title slide.
            </p>
          </div>

          <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 14, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <GateMark />
                <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>Anchor</span>
              </div>
              <ProtocolBadges />
            </div>
            <p style={{ fontSize: 12, color: '#8a8a92', marginTop: 2, lineHeight: 1.5 }}>
              <strong style={{ color: INK }}>Badge row.</strong> Same P/A/S badges already used in the landing
              page&rsquo;s protocol section &mdash; keeps the logo and the page visually consistent.
            </p>
          </div>

          <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 14, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <GateMark />
              <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>Anchor</span>
              <ProtocolDots />
            </div>
            <p style={{ fontSize: 12, color: '#8a8a92', margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: INK }}>Inline dots.</strong> Smallest footprint of the three &mdash; the
              right choice for a favicon-adjacent spot or a compact header where there&rsquo;s no room for text.
            </p>
          </div>
        </div>

        <p style={{ color: '#8a8a92', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
          Standalone marks &mdash; for comparison
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {OPTIONS.map(({ id, name, blurb, Mark: MarkComponent }) => (
            <div
              key={id}
              style={{
                background: PANEL,
                border: `1px solid ${LINE}`,
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <MarkComponent />
                <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Anchor</span>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#050505',
                    border: `1px solid ${LINE}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'scale(0.62)',
                  }}
                >
                  <MarkComponent />
                </div>
                <span style={{ fontSize: 12, color: '#8a8a92' }}>at favicon scale</span>
              </div>

              <div>
                <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{name}</p>
                <p style={{ fontSize: 13, color: '#8a8a92', lineHeight: 1.55, margin: 0 }}>{blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
