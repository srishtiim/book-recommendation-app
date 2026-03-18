import { useState } from 'react';
import HamburgerMenu from '../components/HamburgerMenu';
import AddBookModal from '../components/AddBookModal';
import FairyLights from '../components/FairyLights';
import Posters from '../components/Posters';
import VinylRecords from '../components/VinylRecords';

export default function Parlour() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="page-wrap">
      <FairyLights />
      <Posters />
      <VinylRecords />
      <HamburgerMenu />

      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', minHeight: 600 }}>
        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '3rem', color: 'var(--gold)', fontStyle: 'italic', textAlign: 'center' }}>
          My Parlour — coming soon
        </h1>
      </div>

      <button onClick={() => setShowAdd(true)} style={{
        position: 'fixed', bottom: 30, right: 30, width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg, #e6c875, #c8a040)', color: '#1a0f06',
        border: 'none', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', zIndex: 100
      }}>
        +
      </button>

      {showAdd && <AddBookModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
