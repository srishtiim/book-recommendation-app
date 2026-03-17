const VINYLS = [
  { id: 1, top: 10,  rotate: -8,  labelColor: '#8b2a1a', band: 'THE\nCODEX' },
  { id: 2, top: 110, rotate: 12,  labelColor: '#2a4a35', band: 'ARIA\nVAULT' },
]

function grooveGradient() {
  // conic-gradient simulating vinyl grooves in alternating dark browns
  const stops = []
  const total = 24
  for (let i = 0; i < total; i++) {
    const pct = (i / total) * 100
    const nxt = ((i + 1) / total) * 100
    const col = i % 2 === 0 ? '#1a1208' : '#2a1e10'
    stops.push(`${col} ${pct.toFixed(1)}%`, `${col} ${nxt.toFixed(1)}%`)
  }
  return `conic-gradient(${stops.join(', ')})`
}

const GROOVE = grooveGradient()

export default function VinylRecords() {
  return (
    <div className="vinyls-wrap">
      {VINYLS.map(v => (
        <div key={v.id} className="vinyl"
          style={{
            position: 'absolute', top: v.top, right: 0,
            background: GROOVE,
            transform: `rotate(${v.rotate}deg)`,
            boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
          }}>
          <div className="vinyl-label" style={{ background: v.labelColor }}>
            <div className="vinyl-center-dot" />
            <div className="vinyl-band-name">{v.band}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
