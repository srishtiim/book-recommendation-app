import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../App';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const genres = [
  'Mystery', 'Romance', 'Horror', 'Science Fiction', 'Fantasy', 
  'Thriller', 'Biography', 'Comedy', 'Adventure', 
  'Historical Fiction', 'Drama', 'Classic Literature'
];

export default function AddBookModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState(genres[0]);
  const [status, setStatus] = useState('want_it');
  const [pagesTotal, setPagesTotal] = useState(300);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const user = getUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/parlour/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          book_title: title,
          author,
          genre,
          status,
          pages_total: Number(pagesTotal)
        })
      });
      if (!res.ok) throw new Error('Failed to add record');
      const data = await res.json();
      onClose(); // Prevent memory leaks
      navigate(`/parlour/book/${data.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#f5edd8', width: '100%', maxWidth: 400, padding: '30px 20px', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderRadius: 2 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#1a0f06' }}>✕</button>
        
        <h2 style={{ fontFamily: '"Zilla Slab", serif', textAlign: 'center', color: '#1a0f06', margin: '0 0 16px 0', fontSize: '1.4rem' }}>ADD TO YOUR CRATES</h2>
        <div style={{ height: 1, borderTop: '2px dashed rgba(26,15,6,0.3)', margin: '0 -20px 24px -20px' }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label="TITLE">
            <input required value={title} onChange={e=>setTitle(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="AUTHOR">
            <input required value={author} onChange={e=>setAuthor(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="GENRE">
            <select value={genre} onChange={e=>setGenre(e.target.value)} style={inputStyle}>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="STATUS">
            <select value={status} onChange={e=>setStatus(e.target.value)} style={inputStyle}>
              <option value="want_it">Want It</option>
              <option value="now_spinning">Now Spinning</option>
              <option value="played">Played</option>
              <option value="shelved">Shelved</option>
            </select>
          </Field>
          <Field label="TOTAL PAGES">
            <input type="number" required min="1" value={pagesTotal} onChange={e=>setPagesTotal(e.target.value)} style={inputStyle} />
          </Field>
          
          <button type="submit" disabled={loading} style={{
            marginTop: 20, padding: 12, border: 'none', background: 'linear-gradient(135deg, #e6c875, #c8a040)',
            fontFamily: '"Zilla Slab", serif', fontWeight: 'bold', fontSize: '1rem', color: '#1a0f06', cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            {loading ? 'ADDING...' : 'ADD TO CRATES'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'transparent', border: 'none', borderBottom: '1px solid rgba(26,15,6,0.4)',
  fontFamily: '"Instrument Serif", serif', fontSize: '1.2rem', color: '#1a0f06', outline: 'none',
  padding: '4px 0'
};

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.7rem', color: 'rgba(26,15,6,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      {children}
    </label>
  )
}
