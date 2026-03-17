import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getUser } from '../App'

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function Sconce({ side }) {
  return (
    <div className="sconce" style={{ [side]: '22px' }}>
      <div className="sconce-stem" />
      <div className="sconce-bulb" />
    </div>
  )
}

export default function Entry() {
  const navigate = useNavigate()
  const location = useLocation()
  const hallwayRef = useRef(null)
  const welcomeRef = useRef(null)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  const DURATION = 3200
  const MAX_SCALE = 4.8

  const username = location.state?.username ?? getUser()?.username ?? 'Reader'

  useEffect(() => {
    const animate = ts => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(elapsed / DURATION, 1)
      const eased = easeInOut(t)
      const scale = 1 + (MAX_SCALE - 1) * eased

      if (hallwayRef.current) {
        hallwayRef.current.style.transform = `scale(${scale})`
      }
      if (welcomeRef.current) {
        const fadeStart = 0.38
        const op = t < fadeStart ? 1 : 1 - (t - fadeStart) / (1 - fadeStart)
        welcomeRef.current.style.opacity = Math.max(0, op)
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        navigate('/library', { replace: true })
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [navigate])

  return (
    <div className="entry-screen">
      <p ref={welcomeRef} className="entry-welcome">
        Welcome, {username}.
      </p>

      <div className="hallway-outer">
        <div ref={hallwayRef} className="hallway">
          {/* Horizontal panel lines */}
          {[14, 28, 42, 56, 70, 84].map(pct => (
            <div key={pct} className="hallway-hline" style={{ top: `${pct}%` }} />
          ))}
          {/* Vertical panel lines */}
          {[-55, -28, 28, 55].map((px, i) => (
            <div key={i} className="hallway-vline" style={{ left: `calc(50% + ${px}px)` }} />
          ))}

          <Sconce side="left" />
          <Sconce side="right" />

          {/* Door */}
          <div className="hallway-door">
            <div className="door-panel" style={{ top: 12, height: 58 }} />
            <div className="door-panel" style={{ top: 84, height: 70 }} />
            <div className="door-handle" />
            <div className="door-light" />
          </div>
        </div>
      </div>
    </div>
  )
}
