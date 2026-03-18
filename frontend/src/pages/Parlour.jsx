import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import AddBookModal from '../components/AddBookModal';
import FairyLights from '../components/FairyLights';
import Posters from '../components/Posters';
import VinylRecords from '../components/VinylRecords';
import RecordVisual from '../components/RecordVisual';
import { getUser } from '../App';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Parlour() {
  const [showAdd, setShowAdd] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const navigate = useNavigate();

  const loadRecords = async () => {
    if (!user?.user_id) return;
    try {
      const res = await fetch(`${API}/parlour/${user.user_id}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    // Setting up a window focus listener to refresh when navigating back
    const handleFocus = () => loadRecords();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.user_id]);

  const nowSpinning = records.filter(r => r.status === 'now_spinning');
  
  const [activeTab, setActiveTab] = useState('now_spinning');
  useEffect(() => {
    if (records.length > 0 && nowSpinning.length === 0 && activeTab === 'now_spinning') {
      setActiveTab('played');
    }
  }, [records, nowSpinning.length, activeTab]);

  const [activeSpinningId, setActiveSpinningId] = useState(null);
  useEffect(() => {
    if (nowSpinning.length > 0 && !nowSpinning.find(r => r.id === activeSpinningId)) {
      setActiveSpinningId(nowSpinning[0].id);
    }
  }, [nowSpinning, activeSpinningId]);

  const spinningRecord = nowSpinning.find(r => r.id === activeSpinningId) || nowSpinning[0];
  const spinPct = spinningRecord && spinningRecord.pages_total ? Math.min(100, Math.round((spinningRecord.pages_read || 0) / spinningRecord.pages_total * 100)) : 0;

  const tabCounts = {
    now_spinning: nowSpinning.length,
    played: records.filter(r => r.status === 'played').length,
    want_it: records.filter(r => r.status === 'want_it').length,
    shelved: records.filter(r => r.status === 'shelved').length,
  };

  const displayedRecords = records.filter(r => r.status === activeTab);

  const getEmptyMessage = (tab) => {
    switch (tab) {
      case 'now_spinning': return 'Nothing on the turntable. Add a book and mark it as Now Spinning.';
      case 'played': return 'No finished records yet. Keep spinning.';
      case 'want_it': return 'Your want list is empty. Find something in the Reading Room.';
      case 'shelved': return 'Nothing shelved.';
      default: return 'No records found.';
    }
  };

  return (
    <div className="page-wrap" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <FairyLights />
      <Posters />
      <VinylRecords />
      <HamburgerMenu />

      <div className="page-content" style={{ padding: '0', flex: 1 }}>
        {/* SECTION 1 - NOW SPINNING STRIP */}
        {nowSpinning.length > 0 ? (
          <div 
            onClick={(e) => {
              if (e.target.closest('#mini-records')) return;
              navigate(`/parlour/book/${spinningRecord.id}`);
            }}
            style={{
              position: 'sticky', top: 0, zIndex: 90, background: '#1a0f06',
              borderTop: '1px solid rgba(200,160,64,0.2)', borderBottom: '1px solid rgba(200,160,64,0.2)',
              padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', flexWrap: 'wrap', gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Turntable icon */}
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'conic-gradient(#3a2a10, #1a0f06, #3a2a10)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 4s linear infinite' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c8a040' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.65rem', color: '#c8a040', letterSpacing: '0.3em', textTransform: 'uppercase' }}>NOW SPINNING</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: '1.2rem', fontStyle: 'italic', color: '#f5edd8', whiteSpace: 'nowrap' }}>{spinningRecord.book_title}</span>
                  <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.8rem', color: '#c8a040', whiteSpace: 'nowrap' }}>{spinningRecord.author}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
               {/* mini records if multiple */}
               {nowSpinning.length > 1 && (
                 <div id="mini-records" style={{ display: 'flex', gap: 8, marginRight: 12 }}>
                   {nowSpinning.map(r => (
                     <div key={r.id} onClick={(e) => { e.stopPropagation(); setActiveSpinningId(r.id); }} style={{ 
                       cursor: 'pointer', transition: '0.2s',
                       opacity: r.id === spinningRecord.id ? 1 : 0.4, 
                       transform: r.id === spinningRecord.id ? 'scale(1.15)' : 'scale(1)',
                       boxShadow: r.id === spinningRecord.id ? '0 0 8px rgba(200,160,64,0.5)' : 'none',
                       borderRadius: '50%'
                     }}>
                        <RecordVisual genre={r.genre} status={r.status} size={32} />
                     </div>
                   ))}
                 </div>
               )}

               {/* Progress */}
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                 <div style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.7rem', color: '#c8a040' }}>{spinPct}% · {spinningRecord.pages_read || 0} / {spinningRecord.pages_total || 300} pages</div>
                 <div style={{ width: 120, height: 6, background: '#3a2a10', borderRadius: 3, overflow: 'hidden' }}>
                   <div style={{ width: `${spinPct}%`, height: '100%', background: '#c8a040', transition: 'width 0.3s ease' }} />
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => document.getElementById('crates-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              position: 'sticky', top: 0, zIndex: 90, background: '#1a0f06',
              borderTop: '1px solid rgba(200,160,64,0.2)', borderBottom: '1px solid rgba(200,160,64,0.2)',
              padding: '16px 20px', textAlign: 'center', cursor: 'pointer'
            }}
          >
            <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: '1.3rem', fontStyle: 'italic', color: '#c8a040' }}>
              Drop the needle — mark a book as Now Spinning
            </span>
          </div>
        )}

        {/* SECTION 2 - YOUR CRATES */}
        <div id="crates-section" style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto', zIndex: 10, position: 'relative' }}>
          <h2 style={{ fontFamily: '"Zilla Slab", serif', fontSize: '1.5rem', color: '#c8a040', margin: '0 0 16px 0', borderBottom: '1px solid #c8a040', paddingBottom: 8, fontWeight: 'bold' }}>
            YOUR CRATES
          </h2>
          
          <div style={{ display: 'flex', gap: 24, marginTop: 16, marginBottom: 40, flexWrap: 'wrap' }}>
            <Tab id="now_spinning" label="NOW SPINNING" count={tabCounts.now_spinning} active={activeTab === 'now_spinning'} onClick={() => setActiveTab('now_spinning')} />
            <Tab id="played" label="PLAYED" count={tabCounts.played} active={activeTab === 'played'} onClick={() => setActiveTab('played')} />
            <Tab id="want_it" label="WANT IT" count={tabCounts.want_it} active={activeTab === 'want_it'} onClick={() => setActiveTab('want_it')} />
            <Tab id="shelved" label="SHELVED" count={tabCounts.shelved} active={activeTab === 'shelved'} onClick={() => setActiveTab('shelved')} />
          </div>

          {!loading && displayedRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: '1.4rem', color: '#8b6914', margin: 0 }}>
                {getEmptyMessage(activeTab)}
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: 24,
              justifyItems: 'center'
            }}>
              {displayedRecords.map(r => (
                <RecordCard key={r.id} record={r} onClick={() => navigate(`/parlour/book/${r.id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3 - STATS STRIP (Phase 3 placeholder) */}
        {!loading && (
          <div id="stats-section" style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative' }}>
            <p style={{ fontStyle: 'italic', color: '#8b6914', fontFamily: '"Instrument Serif", Georgia, serif', fontSize: '1.2rem' }}>
              Your stats are being compiled...
            </p>
          </div>
        )}
      </div>

      <button onClick={() => setShowAdd(true)} style={{
        position: 'fixed', bottom: 30, right: 30, width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg, #e6c875, #c8a040)', color: '#1a0f06',
        border: 'none', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', zIndex: 100
      }}>
        +
      </button>

      {showAdd && <AddBookModal onClose={() => { setShowAdd(false); loadRecords(); }} />}
    </div>
  )
}

function Tab({ id, label, count, active, onClick }) {
  const icon = id === 'now_spinning' ? '● ' : id === 'played' ? '✓ ' : id === 'want_it' ? '○ ' : '⏸ ';
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 8px 0',
      fontFamily: '"Zilla Slab", serif', fontSize: '0.85rem', fontWeight: 'bold',
      color: active ? '#c8a040' : '#f5edd8', opacity: active ? 1 : 0.6,
      borderBottom: `3px solid ${active ? '#c8a040' : 'transparent'}`,
      letterSpacing: '0.05em', transition: 'all 0.2s', outline: 'none'
    }}>
      {icon} {label} ({count})
    </button>
  );
}

function RecordCard({ record, onClick }) {
  const [hover, setHover] = useState(false);
  const isPlayed = record.status === 'played';
  const isSpinning = record.status === 'now_spinning';
  const pct = record.pages_total ? Math.min(100, Math.round((record.pages_read || 0) / record.pages_total * 100)) : 0;
  
  const rereadBadge = (record.reread_count && record.reread_count > 0) ? (
    <div style={{
      position: 'absolute', top: -5, right: -5, background: '#c8a040', color: '#1a0f06', 
      fontSize: 10, fontWeight: 'bold', fontFamily: '"Zilla Slab", serif', borderRadius: 10, padding: '2px 6px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }}>
      ×{record.reread_count + 1}
    </div>
  ) : null;

  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', 
        transition: 'all 0.25s ease', transform: hover ? 'translateY(-8px)' : 'none', 
        padding: '10px', borderRadius: 8,
        boxShadow: hover ? '0 8px 20px rgba(200,160,64,0.1)' : 'transparent',
        background: hover ? 'rgba(255,255,255,0.02)' : 'transparent',
        width: '100%', maxWidth: 160
      }}
    >
      <div style={{ position: 'relative', width: 100, height: 100 }}>
         <RecordVisual genre={record.genre} status={record.status} size={100} />
         {rereadBadge}
      </div>
      
      <div style={{ width: '100%', textAlign: 'center', marginTop: 12 }}>
        <h3 style={{ 
          fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: '1rem', color: '#f0e0b8', 
          margin: '0 0 4px 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          lineHeight: '1.1'
        }}>
          {record.book_title}
        </h3>
        <p style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.65rem', color: '#c8a040', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em',     whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {record.author}
        </p>

        {isPlayed && (
           <div style={{ fontSize: '0.8rem', color: '#c8a040', marginTop: 6, opacity: 0.9 }}>
             {Array.from({length: 5}).map((_, i) => <span key={i}>{i < (record.rating||0) ? '★' : '☆'}</span>)}
           </div>
        )}
        
        {isSpinning && (
          <div style={{ fontSize: '0.75rem', color: '#c8a040', marginTop: 6, fontFamily: '"Zilla Slab", serif', fontWeight: 'bold' }}>
             {pct}%
          </div>
        )}
      </div>
    </div>
  );
}
