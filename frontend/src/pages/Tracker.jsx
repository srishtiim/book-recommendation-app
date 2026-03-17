import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import FairyLights from '../components/FairyLights'
import Posters from '../components/Posters'
import VinylRecords from '../components/VinylRecords'
import { getUser } from '../App'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Render repeating horizontal ruled lines across the journal
function JournalRules() {
  return Array.from({ length: 22 }, (_, i) => (
    <div key={i} className="journal-ruled" style={{ top: 60 + i * 28 }} />
  ))
}

export default function Tracker() {
  const user = getUser()
  const location = useLocation()
  const addInputRef = useRef(null)

  const [trackedBooks, setTrackedBooks] = useState([])
  const [addTitle, setAddTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // Pre-fill from Library "Track This Book" navigation
  useEffect(() => {
    const stateBook = location.state?.book
    const lsBook = (() => {
      try { return JSON.parse(localStorage.getItem('ashveil_selected_book')) } catch { return null }
    })()
    const incoming = stateBook ?? lsBook
    if (incoming?.title) {
      setAddTitle(incoming.title)
      localStorage.removeItem('ashveil_selected_book')
      addInputRef.current?.focus()
    }
  }, [location.state])

  // Fetch tracked books on mount
  useEffect(() => {
    if (!user?.user_id) return
    fetch(`${API}/tracker/${user.user_id}`)
      .then(r => r.json())
      .then(d => setTrackedBooks(d.tracked_books ?? []))
      .catch(() => {})
  }, [user?.user_id])

  const handleAdd = async () => {
    const title = addTitle.trim()
    if (!title) return
    setSaving(true); setError('')
    try {
      const res = await fetch(`${API}/tracker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          book_title: title,
          action: 'add',
          status: 'WANT TO READ',
          date_started: new Date().toISOString().split('T')[0],
          pages_read: 0, rating: 0, notes: '',
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail) }
      // Optimistic update
      setTrackedBooks(prev => [...prev, {
        book_title: title, status: 'WANT TO READ', pages_read: 0,
      }])
      setAddTitle('')
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleKeyDown = e => { if (e.key === 'Enter') handleAdd() }

  const handleUpdatePages = async (book, pages) => {
    setTrackedBooks(prev => prev.map(b =>
      b.book_title === book.book_title ? { ...b, pages_read: pages } : b
    ))
    try {
      await fetch(`${API}/tracker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          book_title: book.book_title,
          action: 'update',
          status: book.status,
          pages_read: pages,
          rating: book.rating ?? 0,
          notes: book.notes ?? '',
        }),
      })
    } catch { /* silent — optimistic */ }
  }

  const handleRemove = async book => {
    setTrackedBooks(prev => prev.filter(b => b.book_title !== book.book_title))
    try {
      await fetch(`${API}/tracker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          book_title: book.book_title,
          action: 'remove',
        }),
      })
    } catch { /* silent */ }
  }

  const handleStatusChange = async (book, newStatus) => {
    setTrackedBooks(prev => prev.map(b =>
      b.book_title === book.book_title ? { ...b, status: newStatus } : b
    ))
    try {
      await fetch(`${API}/tracker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          book_title: book.book_title,
          action: 'update',
          status: newStatus,
          pages_read: book.pages_read ?? 0,
          rating: book.rating ?? 0,
          notes: book.notes ?? '',
          date_ended: newStatus === 'FINISHED' ? new Date().toISOString().split('T')[0] : null,
        }),
      })
    } catch { /* silent */ }
  }

  const statusLabels = { 'WANT TO READ': 'Want', 'READING NOW': 'Reading', 'FINISHED': 'Done' }

  return (
    <div className="page-wrap">
      <FairyLights />
      <Posters />
      <VinylRecords />

      <div className="page-content">
        {/* Back link */}
        <p style={{ marginBottom: 24, fontStyle: 'italic', fontSize: '0.88rem' }}>
          <Link to="/library" style={{ color: 'var(--gold-dark)' }}>← Back to the Reading Room</Link>
        </p>

        {/* Journal */}
        <div className="journal-wrap">
          <JournalRules />
          <div className="journal-margin-line" />

          <h1 className="journal-title">My Reading Log</h1>
          <p className="journal-sub">Your private collection of titles.</p>

          {/* Add row */}
          <div className="journal-add-row">
            <input
              ref={addInputRef}
              className="journal-add-input"
              value={addTitle}
              onChange={e => setAddTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a book title…"
            />
            <button className="journal-add-btn" onClick={handleAdd} disabled={saving}>
              {saving ? '…' : 'Add'}
            </button>
          </div>
          {error && (
            <p style={{ paddingLeft: 20, color: '#c84040', fontSize: '0.82rem', marginBottom: 12 }}>
              {error}
            </p>
          )}

          {trackedBooks.length === 0 && (
            <p style={{ paddingLeft: 20, fontStyle: 'italic', color: 'rgba(107,80,48,0.55)', fontSize: '0.9rem' }}>
              Your shelf is empty. Add your first book above.
            </p>
          )}

          {trackedBooks.map((book, i) => (
            <div
              key={book.book_title}
              className="journal-entry"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="entry-index">{i + 1}.</span>
              <span className="entry-title">{book.book_title}</span>

              {/* Status badge — cycles through states on click */}
              <button
                className="entry-status-badge"
                title="Click to change status"
                onClick={() => {
                  const cycle = ['WANT TO READ', 'READING NOW', 'FINISHED']
                  const next = cycle[(cycle.indexOf(book.status) + 1) % cycle.length]
                  handleStatusChange(book, next)
                }}
              >
                {statusLabels[book.status] ?? book.status}
              </button>

              {/* Pages read number input */}
              <input
                type="number"
                className="entry-pages"
                min={0}
                value={book.pages_read ?? 0}
                onChange={e => handleUpdatePages(book, Number(e.target.value))}
                title="Pages read"
              />
              <span style={{ fontSize: '0.7rem', color: 'rgba(107,80,48,0.5)' }}>pg</span>

              <button className="entry-remove" onClick={() => handleRemove(book)} title="Remove">✕</button>
            </div>
          ))}

          {trackedBooks.length > 0 && (
            <p style={{
              paddingLeft: 20, marginTop: 20,
              fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(107,80,48,0.45)',
            }}>
              {trackedBooks.length} {trackedBooks.length === 1 ? 'title' : 'titles'} in your collection.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
