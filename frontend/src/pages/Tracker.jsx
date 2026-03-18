import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import FairyLights from '../components/FairyLights'
import Posters from '../components/Posters'
import VinylRecords from '../components/VinylRecords'
import HamburgerMenu from '../components/HamburgerMenu'
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
  const [addAuthor, setAddAuthor] = useState('')
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
      if (incoming.author) setAddAuthor(incoming.author)
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
    const author = addAuthor.trim()
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
          author: author || undefined,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail) }
      // Optimistic update
      setTrackedBooks(prev => [...prev, {
        book_title: title,
        author: author,
        rating: 0,
        notes: ''
      }])
      setAddTitle('')
      setAddAuthor('')
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleKeyDown = e => { if (e.key === 'Enter') handleAdd() }

  const handleUpdate = async (book, updates) => {
    const updatedBook = { ...book, ...updates }
    setTrackedBooks(prev => prev.map(b =>
      b.book_title === book.book_title ? updatedBook : b
    ))
    try {
      await fetch(`${API}/tracker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          book_title: book.book_title,
          action: 'update',
          rating: updatedBook.rating ?? 0,
          notes: updatedBook.notes ?? '',
        }),
      })
    } catch { /* silent */ }
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

  return (
    <div className="page-wrap">
      <FairyLights />
      <Posters />
      <VinylRecords />
      <HamburgerMenu />

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
          <div className="journal-add-row" style={{ display: 'flex', gap: '10px' }}>
            <input
              ref={addInputRef}
              className="journal-add-input"
              style={{ flex: 1 }}
              value={addTitle}
              onChange={e => setAddTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a book title…"
            />
            <input
              className="journal-add-input"
              style={{ flex: 1 }}
              value={addAuthor}
              onChange={e => setAddAuthor(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Author (optional)"
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
              style={{ animationDelay: `${i * 60}ms`, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
            >
              <span className="entry-index">{i + 1}.</span>
              <span className="entry-title" style={{ flex: '1 1 200px', fontWeight: 'bold' }}>{book.book_title}</span>
              
              <span className="entry-author" style={{ flex: '1 1 150px', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                {book.author ? `by ${book.author}` : ''}
              </span>

              {/* Rating 1-5 */}
              <select
                className="entry-rating"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(107,80,48,0.3)',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  color: 'var(--ink-color)',
                  fontFamily: 'inherit'
                }}
                value={book.rating ?? 0}
                onChange={e => handleUpdate(book, { rating: Number(e.target.value) })}
              >
                <option value={0}>No rating</option>
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>

              {/* Notes */}
              <input
                className="entry-notes"
                style={{
                  flex: '2 1 200px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px dashed rgba(107,80,48,0.3)',
                  color: 'var(--ink-color)',
                  fontFamily: 'inherit'
                }}
                placeholder="Notes..."
                value={book.notes ?? ''}
                onChange={e => handleUpdate(book, { notes: e.target.value })}
              />

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
