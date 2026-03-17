import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setUser } from '../App'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed.')
      setUser({
        user_id: data.user_id,
        username: data.username,
        email: form.email,
        access_token: data.access_token,
      })
      navigate('/entry', { state: { username: data.username } })
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
        <p className="auth-subtitle">Welcome back, reader</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Your password" />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Unlocking the doors…' : 'Enter the Library'}
          </button>
        </form>

        <p className="auth-switch">
          New reader?{' '}
          <Link to="/" style={{ color: 'var(--gold)' }}>Create an account →</Link>
        </p>
      </div>
    </div>
  )
}
