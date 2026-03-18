import React from 'react';

const genreColors = {
  'Mystery': '#1a3a4a',
  'Romance': '#6b2a3a',
  'Horror': '#3a0a0a',
  'Science Fiction': '#1a2a5a',
  'Fantasy': '#1a3a20',
  'Thriller': '#2a2a2a',
  'Biography': '#4a3a10',
  'Comedy': '#4a3a00',
  'Adventure': '#4a2010',
  'Historical Fiction': '#3a1a2a',
  'Drama': '#2a1a3a',
  'Classic Literature': '#3a2a10'
};

export default function RecordVisual({ genre, status, size = 160 }) {
  const color = genreColors[genre] || '#8b6914';
  const initial = (genre || '?').charAt(0).toUpperCase();

  const isSpinning = status === 'now_spinning';
  const isPlayed = status === 'played';
  const isShelved = status === 'shelved';
  const isWantIt = status === 'want_it';

  const containerStyle = {
    position: 'relative',
    width: size,
    height: size,
    borderRadius: '50%',
    background: 'conic-gradient(#1a1208 0deg 15deg, #2a1e10 15deg 30deg, #1a1208 30deg 45deg, #2a1e10 45deg 60deg, #1a1208 60deg 75deg, #2a1e10 75deg 90deg, #1a1208 90deg 105deg, #2a1e10 105deg 120deg, #1a1208 120deg 135deg, #2a1e10 135deg 150deg, #1a1208 150deg 165deg, #2a1e10 165deg 180deg, #1a1208 180deg 195deg, #2a1e10 195deg 210deg, #1a1208 210deg 225deg, #2a1e10 225deg 240deg, #1a1208 240deg 255deg, #2a1e10 255deg 270deg, #1a1208 270deg 285deg, #2a1e10 285deg 300deg, #1a1208 300deg 315deg, #2a1e10 315deg 330deg, #1a1208 330deg 345deg, #2a1e10 345deg 360deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
    animation: isSpinning ? 'spin 4s linear infinite' : 'none',
    transform: isShelved ? 'rotate(3deg)' : 'none',
    filter: isShelved ? 'grayscale(0.4) opacity(0.8)' : 'none',
    border: isWantIt ? '2px dashed rgba(200,160,64,0.5)' : 'none',
    opacity: isWantIt ? 0.7 : 1,
    margin: '0 auto',
    flexShrink: 0
  };

  const labelStyle = {
    width: size * 0.35,
    height: size * 0.35,
    borderRadius: '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    border: isPlayed ? '2px solid rgba(200,160,64,0.8)' : '1px solid rgba(0,0,0,0.2)'
  };

  const holeStyle = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#fff',
    position: 'absolute'
  };

  const initialStyle = {
    fontFamily: '"Zilla Slab", serif',
    color: 'rgba(255,255,255,0.7)',
    fontSize: size * 0.15,
    fontWeight: 'bold',
    position: 'absolute'
  };

  return (
    <>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      <div style={containerStyle}>
        <div style={labelStyle}>
          <div style={initialStyle}>{initial}</div>
          <div style={holeStyle} />
        </div>
      </div>
    </>
  );
}
