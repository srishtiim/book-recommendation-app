// Horizontal ruled lines rendered on top of a card
export function CardRuledLines({ count = 8, startY = 50 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="card-ruled-line" style={{ top: startY + i * 22 }} />
  ))
}

export default function RecommendationCards({ books, onTrack }) {
  return (
    <div className="rec-grid">
      {books.map((book, idx) => {
        const num = String(idx + 1).padStart(3, '0')
        const delayMs = idx * 80

        return (
          <div
            key={`${book.title}-${idx}`}
            className="rec-card"
            style={{ animationDelay: `${delayMs}ms` }}
          >
            <CardRuledLines />

            <div className="card-toprow">
              <span className="card-number">No. {num}</span>
              <div className="card-stamp">
                <span className="card-stamp-text">REC&shy;OM&shy;MEND&shy;ED</span>
              </div>
            </div>

            <div className="card-title">{book.title}</div>
            <div className="card-author">{book.author}</div>
            <div className="card-genre">{book.genres.join(' · ')}</div>
            <div className="card-desc">{book.description}</div>

            <button className="card-track-btn" onClick={() => onTrack(book)}>
              Track This Book →
            </button>
          </div>
        )
      })}
    </div>
  )
}
