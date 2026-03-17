const GENRES = [
  'Adventure', 'Drama', 'Mystery', 'Romance',
  'Fantasy', 'Science Fiction', 'Horror', 'Historical Fiction',
  'Thriller', 'Classic Literature', 'Comedy', 'Biography',
]

const SPINE_COLORS  = ['#6b3a2a','#2a3d4f','#4a3520','#3d2a4a','#2a4a35','#4a2a2a','#3a3020','#2a3a40']
const SPINE_HEIGHTS = [160, 195] // alternating
const SPINE_WIDTHS  = [44, 52, 44, 56, 44, 50, 44, 58, 46, 52, 44, 54]

export default function BookShelf({ selected, onToggle }) {
  const maxReached = selected.length >= 3

  const statusText = selected.length === 0
    ? 'Choose up to three genres from the shelf above.'
    : selected.length === 1
    ? `Selected: ${selected[0]}`
    : selected.length === 2
    ? `Selected: ${selected[0]} · ${selected[1]}`
    : `Selected: ${selected[0]} · ${selected[1]} · ${selected[2]}`

  return (
    <div className="shelf-wrap">
      <div className="shelf-books">
        {GENRES.map((genre, i) => {
          const isSelected = selected.includes(genre)
          const isDimmed   = maxReached && !isSelected

          let cls = 'book-spine'
          if (isSelected) cls += ' selected'
          else if (isDimmed) cls += ' dimmed'

          return (
            <div
              key={genre}
              className={cls}
              style={{
                height: `${SPINE_HEIGHTS[i % 2]}px`,
                width:  `${SPINE_WIDTHS[i % SPINE_WIDTHS.length]}px`,
                background: SPINE_COLORS[i % SPINE_COLORS.length],
                borderTop: isSelected ? '3px solid #c8a040' : '3px solid transparent',
              }}
              onClick={() => !isDimmed && onToggle(genre)}
              title={isDimmed ? 'Max 3 genres' : genre}
            >
              {genre}
            </div>
          )
        })}
      </div>
      <div className="shelf-plank" />
      <p className="shelf-status">{statusText}</p>
    </div>
  )
}
