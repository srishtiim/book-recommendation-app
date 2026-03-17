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

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchDone, setSearchDone] = useState(false)

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

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!searchQuery || searchQuery.trim().length < 2) return
    setSearchError('')
    setIsSearching(true)
    setSearchDone(false)
    try {
      const res = await fetch(`${API}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), user_id: user?.user_id ?? '' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to search.')
      setSearchResults(data)
      setSearchDone(true)
    } catch (err) {
      setSearchError(err.message)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearchDone(false)
    setSearchError('')
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
        <p className="lib-subheading" style={{ marginBottom: 32 }}>Select up to three genres — then discover your next read</p>

        {/* --- SEARCH SECTION --- */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', textAlign: 'center', fontSize: '1.4rem', color: 'var(--gold)', marginBottom: 16 }}>Search the Stacks</h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title or author..."
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(200,160,64,0.3)',
                color: '#f0e0b8',
                fontFamily: '"Instrument Serif", serif',
                fontStyle: 'italic',
                fontSize: '1rem',
                padding: '8px 16px',
                width: '100%',
                maxWidth: '300px',
                outline: 'none',
                borderRadius: '2px'
              }}
            />
            <button 
              type="submit"
              disabled={isSearching}
              style={{
                fontFamily: '"Zilla Slab", serif',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, var(--mustard), var(--gold-dark))',
                color: '#1a0f06',
                padding: '10px 20px',
                border: 'none',
                cursor: 'pointer',
                clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)'
              }}
            >
              Search
            </button>
          </form>

          {isSearching && (
            <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--gold-dark)', marginTop: 16 }}>Searching the stacks...</p>
          )}

          {searchError && (
            <p style={{ textAlign: 'center', color: '#c84040', fontStyle: 'italic', marginTop: 16 }}>{searchError}</p>
          )}

          {searchDone && searchResults.length === 0 && !isSearching && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p style={{ fontStyle: 'italic', color: 'var(--gold-dark)', display: 'inline-block', marginRight: 12 }}>No books found. Try a different search.</p>
              <button onClick={clearSearch} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', textDecoration: 'underline' }}>Clear</button>
            </div>
          )}

          {searchDone && searchResults.length > 0 && !isSearching && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <button onClick={clearSearch} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', textDecoration: 'underline' }}>Clear Search</button>
              </div>
              <RecommendationCards books={searchResults} onTrack={handleTrack} stampType="found" />
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,64,0.3), transparent)', margin: '40px 0' }} />
        {/* --- END SEARCH SECTION --- */}

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
