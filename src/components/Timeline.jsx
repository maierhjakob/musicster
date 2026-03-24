import './Timeline.css';

// Shows the player's timeline with drop-zone slots between each card
export default function Timeline({ cards, onPlace, disabled }) {
  const slotCount = cards.length + 1;

  return (
    <div className="timeline">
      {Array.from({ length: slotCount }, (_, i) => (
        <div key={i} className="timeline-slot-group">
          <button
            className="drop-slot"
            onClick={() => !disabled && onPlace(i)}
            disabled={disabled}
            aria-label={`Place before ${cards[i]?.title ?? 'end'}`}
          >
            <span className="drop-slot-line" />
            <span className="drop-slot-arrow">+</span>
            <span className="drop-slot-line" />
          </button>

          {i < cards.length && (
            <div className="timeline-card">
              <span className="tc-year">{cards[i].year}</span>
              <span className="tc-title">{cards[i].title}</span>
              <span className="tc-artist">{cards[i].artist}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
