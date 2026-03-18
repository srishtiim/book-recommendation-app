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

const genreColors = {
  'Mystery': '#1a3a4a', 'Romance': '#6b2a3a', 'Horror': '#3a0a0a', 'Science Fiction': '#1a2a5a',
  'Fantasy': '#1a3a20', 'Thriller': '#2a2a2a', 'Biography': '#4a3a10', 'Comedy': '#4a3a00',
  'Adventure': '#4a2010', 'Historical Fiction': '#3a1a2a', 'Drama': '#2a1a3a', 'Classic Literature': '#3a2a10'
};

const awardTheme = {
  platinum: { outer: '#e8e8e8', inner: '#c8c8ff', label: 'PLATINUM RECORD' },
  gold: { outer: '#c8a040', inner: '#8b6914', label: 'GOLD RECORD' },
  silver: { outer: '#a0a0a0', inner: '#606060', label: 'SILVER RECORD' },
  bronze: { outer: '#c87a40', inner: '#8b4a10', label: 'BRONZE RECORD' },
};

function PanelContainer({ children }) {
  return (
    <div style={{
      background: '#1a0f06', border: '1px solid rgba(200,160,64,0.2)', borderRadius: 2, padding: 28, height: '100%', boxSizing: 'border-box'
    }}>
      {children}
    </div>
  );
}

function PressReleasePanel({ stats }) {
  if (!stats || stats.total_books === 0) {
    return (
      <PanelContainer>
        <p style={{ fontStyle: 'italic', textAlign: 'center', color: 'rgba(245,237,216,0.6)', fontFamily: '"Instrument Serif", serif', fontSize: '1.2rem' }}>
          Your season hasn't started yet. Add your first record.
        </p>
      </PanelContainer>
    );
  }

  const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(200,160,64,0.1)' };
  const labelStyle = { fontFamily: '"Zilla Slab", serif', fontSize: '0.7rem', color: 'rgba(200,160,64,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' };
  const valStyle = { fontFamily: '"Instrument Serif", serif', fontSize: '1.2rem', fontStyle: 'italic', color: '#f5edd8' };

  return (
    <PanelContainer>
       <div style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.65rem', color: 'rgba(200,160,64,0.5)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 8 }}>
         FOR IMMEDIATE RELEASE
       </div>
       <div style={{ fontFamily: '"Zilla Slab", serif', fontSize: '1.1rem', color: '#c8a040', fontWeight: 'bold', borderBottom: '1px solid rgba(200,160,64,0.3)', paddingBottom: 16, marginBottom: 8 }}>
         VINTAGE LIBRARY RECORDS<br/>
         <span style={{ fontWeight: 'normal', fontSize: '0.9rem', color: 'rgba(200,160,64,0.8)' }}>{new Date().getFullYear()} Reading Season</span>
       </div>
       
       <div style={rowStyle}>
         <span style={labelStyle}>Records Spun</span>
         <span style={valStyle}>{stats.total_books}</span>
       </div>
       <div style={rowStyle}>
         <span style={labelStyle}>Pages Turned</span>
         <span style={valStyle}>{stats.total_pages}</span>
       </div>
       <div style={rowStyle}>
         <span style={labelStyle}>Avg Critical Score</span>
         <span style={valStyle}><span style={{ color: '#c8a040', fontSize: '1rem', fontStyle: 'normal' }}>★</span> {stats.avg_rating}</span>
       </div>
       <div style={{ ...rowStyle, borderBottom: 'none' }}>
         <span style={labelStyle}>Top Genre</span>
         <span style={valStyle}>{stats.top_genre === 'None' ? '-' : stats.top_genre}</span>
       </div>
       <div style={{ borderBottom: '1px solid rgba(200,160,64,0.3)', marginTop: 8 }} />
    </PanelContainer>
  );
}

function EqualizerPanel({ stats }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Small delay to ensure the transition triggers
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [stats]);

  const genres = stats?.books_by_genre || {};
  const entries = Object.entries(genres).filter(([_, count]) => count > 0);
  
  const header = (
    <div style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.7rem', color: '#c8a040', textTransform: 'uppercase', letterSpacing: '0.3em', textAlign: 'center', marginBottom: 24 }}>
      FREQUENCY
    </div>
  );

  if (entries.length === 0) {
    return (
      <PanelContainer>
        {header}
        <p style={{ fontStyle: 'italic', textAlign: 'center', color: 'rgba(245,237,216,0.6)', fontFamily: '"Instrument Serif", serif', fontSize: '1.2rem', marginTop: 40 }}>
          No frequencies detected yet.
        </p>
      </PanelContainer>
    );
  }

  const maxCount = Math.max(...entries.map(e => e[1]));
  
  return (
    <PanelContainer>
      {header}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, height: 160, borderBottom: '1px solid rgba(200,160,64,0.3)', paddingBottom: 2 }}>
        {entries.map(([genre, count], i) => {
          const heightPx = Math.max(10, Math.round((count / maxCount) * 120));
          const color = genreColors[genre] || '#8b6914';
          const shortName = genre.length > 8 ? genre.substring(0, 8) + '…' : genre;
          
          return (
            <div key={genre} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.65rem', color: '#c8a040' }}>{count}</span>
              <div style={{ 
                width: 28, 
                height: mounted ? heightPx : 0, 
                backgroundColor: color,
                transition: 'height 0.8s ease',
                transitionDelay: `${i * 100}ms`,
                borderTopLeftRadius: 2, borderTopRightRadius: 2
              }} />
              <div style={{ height: 60, width: 28, position: 'relative', marginTop: 4 }}>
                <span style={{ 
                  position: 'absolute', top: 0, left: 14, transform: 'rotate(-90deg)', transformOrigin: 'top left',
                  fontFamily: '"Zilla Slab", serif', fontSize: '0.6rem', color: '#f5edd8', whiteSpace: 'nowrap'
                }}>
                  {shortName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </PanelContainer>
  );
}

function WallOfFamePanel({ stats }) {
  const awardsMap = stats?.awards || {};
  const entries = Object.entries(awardsMap);

  const header = (
    <div style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.7rem', color: '#c8a040', textTransform: 'uppercase', letterSpacing: '0.3em', textAlign: 'center', marginBottom: 24 }}>
      WALL OF FAME
    </div>
  );

  if (entries.length === 0) {
    return (
      <PanelContainer>
        {header}
        <div style={{ textAlign: 'center', marginTop: 40, fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#8b6914', lineHeight: 1.4 }}>
          Keep spinning —<br/>awards incoming
        </div>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      {header}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
        {entries.map(([genre, tier]) => {
          const award = awardTheme[tier] || awardTheme.bronze;
          const initial = (genre || '?').charAt(0).toUpperCase();
          const count = stats.books_by_genre[genre] || 0;
          
          return (
            <div key={genre} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80 }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: '50%', background: '#1a0f06', 
                border: `4px solid ${award.outer}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)', marginBottom: 12
              }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%', background: award.inner,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{initial}</span>
                </div>
              </div>
              
              <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.65rem', color: '#f5edd8', textAlign: 'center', lineHeight: 1.1, marginBottom: 4 }}>
                {genre}
              </span>
              <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '0.55rem', color: '#c8a040', letterSpacing: '0.05em', textAlign: 'center', textTransform: 'uppercase', marginBottom: 2 }}>
                {award.label}
              </span>
              <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(200,160,64,0.7)', textAlign: 'center' }}>
                {count} {count === 1 ? 'record' : 'records'}
              </span>
            </div>
          );
        })}
      </div>
    </PanelContainer>
  );
}

export default function Parlour() {
  const [showAdd, setShowAdd] = useState(false);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  const user = getUser();
  const navigate = useNavigate();

  const loadData = async () => {
    if (!user?.user_id) return;
    try {
      const [recordsRes, statsRes] = await Promise.all([
        fetch(`${API}/parlour/${user.user_id}`),
        fetch(`${API}/parlour/stats/${user.user_id}`)
      ]);
      if (recordsRes.ok) {
        const data = await recordsRes.json();
        setRecords(data.records || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleFocus = () => loadData();
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

        {/* SECTION 3 - STATS STRIP */}
        <div id="stats-section" style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto', zIndex: 10, position: 'relative' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, justifyContent: 'center' }}>
              <span style={{ color: '#c8a040', opacity: 0.5, letterSpacing: '-0.1em' }}>━━━━━</span>
              <span style={{ fontFamily: '"Zilla Slab", serif', fontSize: '1.2rem', color: '#c8a040', fontWeight: 'bold' }}>
                YOUR PRESS SHEET
              </span>
              <span style={{ color: '#c8a040', opacity: 0.5, letterSpacing: '-0.1em' }}>━━━━━</span>
           </div>
           
           {statsLoading ? (
             <div style={{ minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <p style={{ fontStyle: 'italic', color: '#8b6914', fontFamily: '"Instrument Serif", Georgia, serif', fontSize: '1.2rem' }}>
                 Compiling your press sheet...
               </p>
             </div>
           ) : (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                <PressReleasePanel stats={stats} />
                <EqualizerPanel stats={stats} />
                <WallOfFamePanel stats={stats} />
             </div>
           )}
        </div>
      </div>

      <button onClick={() => setShowAdd(true)} style={{
        position: 'fixed', bottom: 30, right: 30, width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg, #e6c875, #c8a040)', color: '#1a0f06',
        border: 'none', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', zIndex: 100
      }}>
        +
      </button>

      {showAdd && <AddBookModal onClose={() => { setShowAdd(false); loadData(); }} />}
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
