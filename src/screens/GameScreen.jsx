import { useState } from 'react';
import { useGame } from '../context/GameContext';
import SongCard from '../components/SongCard';
import Timeline from '../components/Timeline';
import './GameScreen.css';

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const { timeline, currentCard, roundResult, showYear, deck } = state;

  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredSlot, setHoveredSlot] = useState(null);

  function handlePointerDown(e) {
    if (showYear) return;
    e.preventDefault();
    setDragging(true);
    setDragPos({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const slotEl = elements.find(el => el.dataset && el.dataset.slotIndex !== undefined);
    setHoveredSlot(slotEl ? parseInt(slotEl.dataset.slotIndex) : null);
  }

  function handlePointerUp(e) {
    if (!dragging) return;
    setDragging(false);
    if (hoveredSlot !== null) {
      dispatch({ type: 'PLACE_CARD', position: hoveredSlot });
    }
    setHoveredSlot(null);
  }

  return (
    <div className="game-screen">
      {/* Top bar */}
      <div className="game-topbar">
        <button className="btn-back" onClick={() => dispatch({ type: 'GO_HOME' })}>✕</button>
        <div className="deck-count">{deck.length} remaining</div>
      </div>

      {/* Current card */}
      <div className="card-area">
        <p className="card-area-label">
          {showYear
            ? (roundResult === 'correct' ? '✅ Correct!' : '❌ Wrong!')
            : 'Drag this song into your timeline'}
        </p>

        <div
          className={`card-draggable ${dragging ? 'is-dragging' : ''} ${showYear ? 'no-drag' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <SongCard song={currentCard} revealed={showYear} />
        </div>
      </div>

      {/* Floating ghost card while dragging */}
      {dragging && (
        <div
          className="card-ghost"
          style={{ left: dragPos.x - 45, top: dragPos.y - 31 }}
        />
      )}

      {/* Timeline */}
      <div className="timeline-area">
        <p className="timeline-label">
          Your timeline
          <span className="timeline-count"> ({timeline.length} cards)</span>
        </p>
        <Timeline
          cards={timeline}
          hoveredSlot={dragging ? hoveredSlot : null}
          disabled={showYear}
          newCardId={roundResult === 'correct' ? currentCard?.id : null}
        />
      </div>

      {/* Footer after placement */}
      {showYear && (
        <div className="game-footer">
          <div className={`result-banner ${roundResult}`}>
            {roundResult === 'correct'
              ? 'Added to your timeline!'
              : `Nope — it was ${currentCard?.year}`}
          </div>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'NEXT_CARD' })}>
            {deck.length === 0 ? 'See results →' : 'Next card →'}
          </button>
        </div>
      )}
    </div>
  );
}
