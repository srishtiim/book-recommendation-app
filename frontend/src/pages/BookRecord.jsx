import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RecordVisual from '../components/RecordVisual';
import { getUser } from '../App';
import FairyLights from '../components/FairyLights';
import Posters from '../components/Posters';
import VinylRecords from '../components/VinylRecords';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const genreColors = {
  'Mystery': '#1a3a4a', 'Romance': '#6b2a3a', 'Horror': '#3a0a0a', 'Science Fiction': '#1a2a5a',
  'Fantasy': '#1a3a20', 'Thriller': '#2a2a2a', 'Biography': '#4a3a10', 'Comedy': '#4a3a00',
  'Adventure': '#4a2010', 'Historical Fiction': '#3a1a2a', 'Drama': '#2a1a3a', 'Classic Literature': '#3a2a10'
};

export default function BookRecord() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingLiner, setSavingLiner] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Local state for forms
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetch(`${API}/parlour/record/${recordId}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setRecord(data);
        setReviewText(data.review || '');
        setRating(data.rating || 0);
        setLoading(false);
      })
      .catch(() => navigate('/parlour'));
  }, [recordId, navigate]);

  const updateRecord = async (updates) => {
    // Optimistic local update
    setRecord(prev => ({ ...prev, ...updates }));
    try {
      const res = await fetch(`${API}/parlour/record/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const fresh = await res.json();
        setRecord(fresh);
      }
    } catch (e) { console.error('Failed update', e); }
  };

  const deleteRecord = async () => {
    try {
      await fetch(`${API}/parlour/record/${recordId}`, { method: 'DELETE' });
      navigate('/parlour');
    } catch (e) { console.error(e); }
  };

  const handleStatusChange = (newStatus) => {
    if (record.status === newStatus) return;
    updateRecord({ status: newStatus });
  };

  const saveLinerNotes = async () => {
    setSavingLiner(true);
    await updateRecord({ rating, review: reviewText });
    setTimeout(() => setSavingLiner(false), 2000);
  };

  if (loading || !record) return null;

  const color = genreColors[record.genre] || '#8b6914';
  const showProgress = record.status === 'now_spinning' || record.status === 'played';
  const progressPct = record.pages_total ? Math.min(100, Math.round((record.pages_read || 0) / record.pages_total * 100)) : 0;

  return (
    <div className="page-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <FairyLights />
      <Posters />
      <VinylRecords />
      
      <div style={{ width: '100%', maxWidth: 680, padding: '20px', zIndex: 10, position: 'relative' }}>
        <Link to="/parlour" style={{ color: '#c8a040', fontStyle: 'italic', fontSize: '0.9rem', textDecoration: 'none' }}>
          ← Back to My Parlour
        </Link>

        {/* Record Visual */}
        <div style={{ marginTop: 40, marginBottom: 20 }}>
          <RecordVisual genre={record.genre} status={record.status} size={160} />
        </div>

        {/* Identity */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ fontFamily: '"Zilla Slab", serif', fontSize: '1.8rem', color: '#f0e0b8', margin: '0 0 4px 0' }}>{record.book_title}</h1>
          <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: '1.2rem', color: '#8b6914', margin: '0 0 12px 0', fontStyle: 'italic' }}>{record.author}</p>
          <span style={{ 
            background: `${color}66`, color: '#fff', padding: '4px 10px', borderRadius: 20, 
            fontFamily: '"Zilla Slab", serif', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {record.genre}
          </span>
        </div>

        {/* Status Stamps */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <Stamp label="NOW SPINNING" active={record.status === 'now_spinning'} activeColor="#2a3d8b" onClick={() => handleStatusChange('now_spinning')} />
          <Stamp label="PLAYED" active={record.status === 'played'} activeColor="#2a5a2a" onClick={() => handleStatusChange('played')} />
          <Stamp label="WANT IT" active={record.status === 'want_it'} activeColor="#8b6914" onClick={() => handleStatusChange('want_it')} />
          <Stamp label="SHELVED" active={record.status === 'shelved'} activeColor="#4a4a4a" onClick={() => handleStatusChange('shelved')} />
        </div>

        {/* Dates Card */}
        <div style={{ background: '#f5edd8', padding: '15px 20px', borderRadius: 4, border: '1px solid rgba(139,105,20,0.2)', marginBottom: 30, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <DateInput label="DATE BORROWED" value={record.start_date || ''} onChange={val => updateRecord({ start_date: val || null })} />
          <DateInput label="DATE RETURNED" value={record.finish_date || ''} onChange={val => updateRecord({ finish_date: val || null })} />
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div style={{ marginBottom: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.7rem', color: 'rgba(240,224,184,0.6)' }}>SIDE A</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: '"Zilla Slab", serif', fontSize: '0.85rem', color: '#f0e0b8' }}>
                <NumberInput value={record.pages_read || 0} onChange={val => updateRecord({ pages_read: val })} max={record.pages_total} />
                <span style={{ color: 'rgba(240,224,184,0.5)' }}>/</span>
                <NumberInput value={record.pages_total || 300} onChange={val => updateRecord({ pages_total: val })} min={record.pages_read || 0} />
                <span style={{ color: 'rgba(240,224,184,0.5)' }}>pages</span>
                <span style={{ color: '#c8a040', marginLeft: 8 }}>{progressPct}%</span>
              </div>
            </div>
            {/* Grooves / Bar */}
            <div style={{ height: 12, background: '#6b5030', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${progressPct}%`, background: '#3a2a10', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* Re-Read Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, justifyContent: 'center' }}>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
            <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={(record.reread_count || 0) > 0} onChange={e => {
              const count = e.target.checked ? Math.max(1, (record.reread_count || 0) + 1) : Math.max(0, (record.reread_count || 0) - 1);
              updateRecord({ reread_count: count });
            }} />
            <span style={{
              position: 'absolute', cursor: 'pointer', inset: 0, background: (record.reread_count || 0) > 0 ? '#c8a040' : '#4a3a10',
              borderRadius: 24, transition: '0.4s', border: '2px solid #3a2a10'
            }}>
              <span style={{
                position: 'absolute', content: '""', height: 16, width: 16, left: 2, top: 2, background: '#f5edd8',
                transition: '0.4s', borderRadius: '50%', transform: (record.reread_count || 0) > 0 ? 'translateX(20px)' : 'none'
              }} />
            </span>
          </label>
          <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.85rem', color: 'rgba(240,224,184,0.7)' }}>
            {record.reread_count > 0 ? `${record.reread_count + 1}${['st','nd','rd'][Math.min(record.reread_count, 3)] || 'th'} listen` : '1st listen'}
          </span>
        </div>

        {/* Liner Notes */}
        <div style={{ 
          background: '#f5edd8', padding: '24px 20px', position: 'relative',
          clipPath: 'polygon(0% 4px, 5% 0px, 10% 3px, 15% 0px, 20% 4px, 25% 0px, 30% 2px, 35% 0px, 40% 4px, 45% 0px, 50% 3px, 55% 0px, 60% 5px, 65% 0px, 70% 3px, 75% 0px, 80% 4px, 85% 0px, 90% 2px, 95% 0px, 100% 4px, 100% 100%, 0% 100%)',
          marginBottom: 40
        }}>
          <h3 style={{ fontFamily: '"Zilla Slab", serif', fontSize: '1rem', color: '#1a0f06', borderBottom: '1px solid rgba(200,160,64,0.5)', paddingBottom: 8, margin: '14px 0 20px' }}>LINER NOTES</h3>
          
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#c8a040', padding: 0 }}>
                {rating >= star ? '★' : '☆'}
              </button>
            ))}
          </div>

          <textarea 
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Your review..."
            style={{
              width: '100%', minHeight: 160, background: 'transparent', border: 'none', outline: 'none', resize: 'vertical',
              fontFamily: '"Instrument Serif", serif', fontSize: '1.2rem', fontStyle: 'italic', color: '#2a1e10',
              backgroundImage: 'linear-gradient(rgba(26,15,6,0.1) 1px, transparent 1px)',
              backgroundSize: '100% 28px', lineHeight: '28px', paddingLeft: 16,
              borderLeft: '2px solid rgba(200,64,64,0.5)', paddingTop: 4
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <button onClick={saveLinerNotes} style={{
              background: 'linear-gradient(135deg, #e6c875, #c8a040)', color: '#1a0f06', border: 'none', borderRadius: 30,
              padding: '10px 24px', fontFamily: '"Zilla Slab", serif', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transition: '0.2s'
            }}>
              <span style={{ fontSize: '1.2rem' }}>●</span>
              {savingLiner ? 'SEALED ✓' : 'PRESS TO SAVE'}
            </button>
          </div>
        </div>

        {/* Delete */}
        <div style={{ textAlign: 'center', paddingBottom: 60 }}>
          {showConfirm ? (
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 8 }}>
              <p style={{ color: '#f0e0b8', margin: '0 0 12px 0', fontSize: '0.9rem' }}>Are you sure? This cannot be undone.</p>
              <button onClick={() => setShowConfirm(false)} style={{ background: 'none', border: '1px solid #8b6914', color: '#f0e0b8', padding: '4px 12px', marginRight: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={deleteRecord} style={{ background: '#8b2a2a', border: 'none', color: '#fff', padding: '5px 12px', cursor: 'pointer' }}>Remove</button>
            </div>
          ) : (
            <button onClick={() => setShowConfirm(true)} style={{ background: 'none', border: 'none', color: '#a05050', fontStyle: 'italic', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer' }}>
              Remove this record from your crates
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stamp({ label, active, activeColor, onClick }) {
  const [pressed, setPressed] = useState(false);
  
  return (
    <button
      onClick={() => {
        setPressed(true);
        setTimeout(() => setPressed(false), 150);
        onClick();
      }}
      style={{
        background: active ? '#ece0c4' : '#f5edd8',
        border: `2px solid ${active ? activeColor : 'rgba(26,15,6,0.3)'}`,
        color: active ? activeColor : 'rgba(26,15,6,0.5)',
        padding: '6px 12px',
        fontFamily: '"Zilla Slab", serif',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        letterSpacing: '0.05em',
        borderRadius: 4,
        cursor: 'pointer',
        boxShadow: active ? `inset 0 2px 4px rgba(0,0,0,0.1)` : '0 2px 4px rgba(0,0,0,0.1)',
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.1s'
      }}
    >
      {active ? `● ${label}` : `○ ${label}`}
    </button>
  );
}

function DateInput({ label, value, onChange }) {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.65rem', color: 'rgba(26,15,6,0.5)', letterSpacing: '0.05em' }}>{label}</span>
      <input 
        type="date"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { if (val !== value) onChange(val); }}
        style={{
          background: 'transparent', border: 'none', borderBottom: '1px solid #c8a040',
          fontFamily: '"Zilla Slab", serif', fontSize: '0.9rem', color: '#1a0f06', outline: 'none'
        }}
      />
    </label>
  );
}

function NumberInput({ value, onChange, min, max }) {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);

  return (
    <input 
      type="number"
      value={val}
      min={min} max={max}
      onChange={e => setVal(e.target.value)}
      onBlur={() => { const num = parseInt(val, 10); if (!isNaN(num) && num !== value) onChange(num); else setVal(value); }}
      style={{
        width: 48, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(240,224,184,0.3)',
        color: '#f0e0b8', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', outline: 'none'
      }}
    />
  );
}
