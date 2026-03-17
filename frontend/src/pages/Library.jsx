import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FairyLights from '../components/FairyLights'
import Posters from '../components/Posters'
import VinylRecords from '../components/VinylRecords'
import BookShelf from '../components/BookShelf'
import RecommendationCards from '../components/RecommendationCards'
import { getUser } from '../App'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Library() {
  const navigate = useNavigate()
  const user = getUser()

  const [selectedGenres, setSelectedGenres] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const toggleGenre = genre => {
    setSearched(false)
    setBooks([])
    setSelectedGenres(prev => {
      if (prev.includes(genre)) return prev.filter(g => g !== genre)
      if (prev.length >= 3) return prev
      return [...prev, genre]
    })
  }

  const handleFindBooks = async () => {
    if (selectedGenres.length === 0 || selectedGenres.length > 3) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genres: selectedGenres, user_id: user?.user_id ?? '' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch recommendations.')
      setBooks(data)
      setSearched(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTrack = book => {
    localStorage.setItem('ashveil_selected_book', JSON.stringify(book))
    navigate('/tracker', { state: { book } })
  }

  return (
    <div className="page-wrap">
      <FairyLights />
      <Posters />
      <VinylRecords />

      <div className="page-content">
        <h1 className="lib-heading">The Reading Room</h1>
        <p className="lib-subheading">Select up to three genres — then discover your next read</p>

        <BookShelf selected={selectedGenres} onToggle={toggleGenre} />

        {/* Ticket stub — only shows when exactly 3 genres selected */}
        {selectedGenres.length === 3 && (
          <div className="ticket-wrap">
            <button
              className="ticket-btn"
              onClick={handleFindBooks}
              disabled={loading}
            >
              {loading ? 'Searching the stacks…' : '✦ Find My Reads ✦'}
            </button>
          </div>
        )}

        {error && (
          <p style={{ textAlign: 'center', color: '#c84040', fontStyle: 'italic', marginTop: 16 }}>
            {error}
          </p>
        )}

        {searched && books.length === 0 && !loading && (
          <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--gold-dark)', marginTop: 32 }}>
            No books found for those genres. Try a different combination.
          </p>
        )}

        {books.length > 0 && (
          <>
            <h2 style={{
              fontStyle: 'italic', fontSize: '1.6rem', color: 'var(--gold)',
              textAlign: 'center', marginTop: 40, marginBottom: 8,
            }}>
              Recommended Matches
            </h2>
            <RecommendationCards books={books} onTrack={handleTrack} />
          </>
        )}
      </div>
    </div>
  )
}
