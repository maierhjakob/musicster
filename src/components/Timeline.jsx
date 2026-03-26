import './Timeline.css';

export default function Timeline({ cards, hoveredSlot, disabled, newCardId }) {
  const slotCount = cards.length + 1;

  return (
    <div className="timeline">
      {Array.from({ length: slotCount }, (_, i) => (
        <div key={i} className="timeline-slot-group">
          <div
            className={`drop-zone ${hoveredSlot === i ? 'hovered' : ''} ${disabled ? 'disabled' : ''}`}
            data-slot-index={i}
          >
            <span className="drop-zone-line" />
            <span className="drop-zone-arrow">↓</span>
            <span className="drop-zone-line" />
          </div>

          {hoveredSlot === i && !disabled && (
            <div className="timeline-card-preview" />
          )}

          {i < cards.length && (
            <div className={`timeline-card ${cards[i].id === newCardId ? 'pop-in' : ''}`}>
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
