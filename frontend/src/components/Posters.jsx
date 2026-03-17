export default function Posters() {
  return (
    <div className="posters-wrap">
      {/* Poster 1 */}
      <div className="poster" style={{ left: '2%', top: '0px', transform: 'rotate(-3deg)' }}>
        <div className="poster-pin" />
        <div className="poster-stripe" style={{ background: '#8b2a1a' }} />
        <div className="poster-title">THE VELVET CODEX</div>
        <div className="poster-sub">A Literary Evening</div>
        <div className="poster-date">SEPT XIV · MDCCCXCII</div>
        <div className="poster-stripe-bottom" style={{ background: '#8b2a1a' }} />
      </div>

      {/* Poster 2 */}
      <div className="poster" style={{ left: '5%', top: '270px', transform: 'rotate(2.5deg)' }}>
        <div className="poster-pin" />
        <div className="poster-stripe" style={{ background: '#2a4a6b' }} />
        <div className="poster-title">ECHO & THE MARGINALIA</div>
        <div className="poster-sub">World Reading Tour</div>
        <div className="poster-date">OCT III · MDCCCCI</div>
        <div className="poster-stripe-bottom" style={{ background: '#2a4a6b' }} />
      </div>
    </div>
  )
}
