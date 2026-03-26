import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useSpotify } from '../context/SpotifyContext';
import SongCard from '../components/SongCard';
import Timeline from '../components/Timeline';
import './GameScreen.css';

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const { timeline, currentCard, roundResult, showYear, deck } = state;
  const { isConnected, isPlaying, playTrack, togglePlay } = useSpotify();

  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Auto-play each new card via Spotify
  useEffect(() => {
    if (currentCard && !showYear && isConnected) {
      playTrack(currentCard.title, currentCard.artist);
    }
  }, [currentCard?.id, isConnected]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (showYear) return;
    e.preventDefault();
    setDragging(true);
    setDragPos({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const cardEl = elements.find(
      el => el instanceof HTMLElement && el.dataset.cardIndex !== undefined
    ) as HTMLElement | undefined;
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      const cardIndex = parseInt(cardEl.dataset.cardIndex!);
      const isLeftHalf = e.clientX < rect.left + rect.width / 2;
      setHoveredSlot(isLeftHalf ? cardIndex : cardIndex + 1);
    } else {
      const inTimeline = elements.some(
        el => el instanceof HTMLElement && el.classList.contains('timeline')
      );
      if (inTimeline) {
        const cardEls = Array.from(
          document.querySelectorAll<HTMLElement>('[data-card-index]')
        );
        let slot = 0;
        for (const c of cardEls) {
          const rect = c.getBoundingClientRect();
          if (e.clientX > rect.left + rect.width / 2) {
            slot = parseInt(c.dataset.cardIndex!) + 1;
          }
        }
        setHoveredSlot(slot);
      } else {
        setHoveredSlot(null);
      }
    }
  }

  function handlePointerUp() {
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

        {isConnected && !showYear && (
          <button className="btn-play-pause" onClick={togglePlay} aria-label="Toggle playback">
            {isPlaying ? '⏸' : '▶'}
          </button>
        )}
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
          newCardId={roundResult === 'correct' ? (currentCard?.id ?? null) : null}
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
