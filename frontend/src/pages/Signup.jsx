import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setUser } from '../App'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Sign up failed.')
      setUser({ user_id: data.user_id, username: form.name, email: form.email })
      navigate('/entry', { state: { username: form.name } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-eyebrow">Private Collection</p>
        <h1 className="auth-title">The Ashveil Library</h1>
        <div className="auth-divider" />
        <p className="auth-subtitle">Begin your literary journey</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Name</label>
            <input className="auth-input" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="At least 6 characters" />
          </div>
          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <input className="auth-input" name="confirm" type="password" value={form.confirm} onChange={handleChange} required placeholder="Repeat password" />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Opening the doors…' : 'Enter the Archive'}
          </button>
        </form>

        <p className="auth-switch">
          Already a member?{' '}
          <Link to="/login" style={{ color: 'var(--gold)' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
