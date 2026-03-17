import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLights, getUser } from '../App'

const BULB_COLORS = ['#ffb347', '#ffd700', '#ff9f40', '#ffe066', '#ffcc44', '#ffa830']
const N = 24

// Pre-compute bulb positions along quadratic bezier:
// P0=(0,15) P1=(600,40) P2=(1200,15) in viewBox 0 0 1200 60
// Simplification: x=1200t, y=15+50t(1-t)
const BULBS = Array.from({ length: N }, (_, i) => {
  const t = (i + 0.5) / N
  return {
    x: Math.round(1200 * t),
    y: Math.round(15 + 50 * t * (1 - t)),
    color: BULB_COLORS[i % BULB_COLORS.length],
  }
})

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 7.9) % 88}%`,
  top:  `${20 + (i * 17) % 60}%`,
  dur:  `${5 + (i * 0.7) % 3}s`,
  del:  `${-((i * 0.6) % 5)}s`,
}))

export default function FairyLights() {
  const { lightsOn, toggleLights } = useLights()
  const [dimmed, setDimmed] = useState(null)
  const navigate = useNavigate()
  const user = getUser()

  useEffect(() => {
    const iv = setInterval(() => {
      const idx = Math.floor(Math.random() * N)
      setDimmed(idx)
      setTimeout(() => setDimmed(null), 130)
    }, 850)
    return () => clearInterval(iv)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('ashveil_user')
    navigate('/')
  }

  const strColor = lightsOn ? '#8b6914' : '#1e1608'

  return (
    <>
      <header className={`lights-header ${lightsOn ? 'on' : 'off'}`}>
        {/* SVG fairy lights */}
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none"
          style={{ width: '100%', height: '56px', display: 'block' }}>
          <defs>
            <filter id="glow-blur"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>
          {/* String */}
          <path d="M 0 15 Q 600 40 1200 15" stroke={strColor} strokeWidth="1.5" fill="none" />
          {/* Bulbs */}
          {BULBS.map((b, i) => {
            const isDimmed = dimmed === i
            const op = !lightsOn ? 0.05 : isDimmed ? 0.12 : 1
            return (
              <g key={i} style={{ opacity: op, transition: 'opacity 0.15s' }}>
                {lightsOn && !isDimmed && (
                  <ellipse cx={b.x} cy={b.y + 18} rx="10" ry="5"
                    fill={b.color} opacity="0.28" filter="url(#glow-blur)" />
                )}
                <rect x={b.x - 4} y={b.y} width="8" height="12" rx="2"
                  fill={lightsOn ? b.color : '#2a1e10'} />
              </g>
            )
          })}
        </svg>

        {/* Nav overlaid */}
        <nav className="lights-nav">
          <Link to="/library" className="nav-brand">The Ashveil Library</Link>
          <div className="nav-right">
            <span className="nav-username">{user?.username}</span>
            <Link to="/tracker" className="nav-link">My Shelf</Link>
            <button className="nav-leave" onClick={handleLogout}>Leave</button>
            <button
              className={`lights-toggle ${lightsOn ? 'on' : 'off'}`}
              onClick={toggleLights}
              title={lightsOn ? 'Turn lights off' : 'Turn lights on'}
              style={{ pointerEvents: 'auto' }}
            >
              <div className={`toggle-knob ${lightsOn ? 'on' : 'off'}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Dust particles when lights on */}
      {lightsOn && PARTICLES.map(p => (
        <div key={p.id} className="dust-particle"
          style={{ left: p.left, top: p.top, animation: `drift ${p.dur} ${p.del} linear infinite` }}
        />
      ))}
    </>
  )
}
