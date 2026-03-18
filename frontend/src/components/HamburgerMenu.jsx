import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Toggle Button */}
      <button 
        style={{
          position: 'fixed', top: 20, left: 20, zIndex: 1000,
          background: 'none', border: 'none', cursor: 'pointer',
          width: 32, height: 32, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-around', padding: 0
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ width: '100%', height: 3, background: '#c8a040', transition: '0.35s', transform: isOpen ? 'rotate(45deg) translate(8px, 8px)' : 'none' }} />
        <div style={{ width: '100%', height: 3, background: '#c8a040', transition: '0.35s', opacity: isOpen ? 0 : 1 }} />
        <div style={{ width: '100%', height: 3, background: '#c8a040', transition: '0.35s', transform: isOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none' }} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Menu Panel */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
        background: '#1a0f06', borderRight: '1px solid rgba(200,160,64,0.2)',
        boxShadow: '4px 0 15px rgba(0,0,0,0.5)', zIndex: 999,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s ease',
        padding: '60px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16
      }}>
        {/* Header */}
        <h2 style={{ fontFamily: '"Zilla Slab", serif', color: '#c8a040', margin: '0 0 20px 0', borderBottom: '1px solid rgba(200,160,64,0.3)', paddingBottom: 10, fontSize: '1.2rem', fontWeight: 'bold' }}>
          🎵 THE RECORD STORE
        </h2>

        {/* Links */}
        <MenuLink to="/library" icon="📚" label="Reading Room" isActive={location.pathname === '/library'} onClick={() => setIsOpen(false)} />
        <MenuLink to="/parlour" icon="🎵" label="My Parlour" isActive={location.pathname.startsWith('/parlour')} onClick={() => setIsOpen(false)} />
        <MenuLink to="/library" icon="🔍" label="Search the Stacks" 
          isActive={false} 
          onClick={() => {
            setIsOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
        />
        <MenuLink to="/tracker" icon="📓" label="My Old Log" isActive={location.pathname === '/tracker'} onClick={() => setIsOpen(false)} />
      </div>
    </>
  )
}

function MenuLink({ to, icon, label, isActive, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <Link 
      to={to} 
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', textDecoration: 'none',
        color: isActive ? '#f0e0b8' : 'rgba(240,224,184,0.7)',
        fontFamily: '"Zilla Slab", serif', fontSize: '1.1rem',
        background: isActive ? 'rgba(200,160,64,0.1)' : 'transparent',
        borderLeft: `3px solid ${isActive ? '#c8a040' : 'rgba(200,160,64,0.3)'}`,
        transform: hover ? 'translateX(4px)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
