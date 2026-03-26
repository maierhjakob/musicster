import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';
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
  // previewState tracks the card ID of the loaded preview and whether it's playing.
  // Derived values go stale naturally when currentCard changes, avoiding synchronous setState in effects.
  const [previewState, setPreviewState] = useState<{ cardId: number; playing: boolean } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasPreview = previewState?.cardId === currentCard?.id;
  const isPreviewPlaying = hasPreview && (previewState?.playing ?? false);

  // Auto-play each new card; audio continues playing through the reveal until Next card is pressed
  useEffect(() => {
    if (!currentCard) return;

    // Clean up previous audio without calling setState (event listeners handle that)
    audioRef.current?.pause();
    audioRef.current = null;

    if (isConnected) {
      playTrack(currentCard.title, currentCard.artist);
    } else {
      let cancelled = false;
      const cardId = currentCard.id;
      const q = encodeURIComponent(`"${currentCard.title}" "${currentCard.artist}"`);
      const deezerFetch = Capacitor.isNativePlatform()
        ? CapacitorHttp.get({ url: `https://api.deezer.com/search?q=${q}&limit=1` }).then((r) => r.data)
        : fetch(`/deezer-api/search?q=${q}&limit=1`).then((r) => r.json());
      deezerFetch
        .then((d) => {
          if (cancelled) return;
          const url: string | undefined = d.data?.[0]?.preview;
          if (!url) return;
          const audio = new Audio(url);
          audioRef.current = audio;
          setPreviewState({ cardId, playing: false });
          audio.addEventListener('play', () => setPreviewState({ cardId, playing: true }));
          audio.addEventListener('pause', () => setPreviewState((s) => (s?.cardId === cardId ? { cardId, playing: false } : s)));
          audio.addEventListener('ended', () => setPreviewState((s) => (s?.cardId === cardId ? { cardId, playing: false } : s)));
          audio.play().catch(() => {});
        })
        .catch(() => {});

      return () => {
        cancelled = true;
        audioRef.current?.pause();
        audioRef.current = null;
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCard?.id, isConnected]); // intentional: card ID guards re-runs; playTrack is stable but recreated each render

  function handleTogglePlay() {
    if (isConnected) {
      togglePlay();
    } else if (audioRef.current) {
      if (isPreviewPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }

  const showPlayButton = !showYear && (isConnected || hasPreview);
  const activeIsPlaying = isConnected ? isPlaying : isPreviewPlaying;

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

        {showPlayButton && (
          <button className="btn-play-pause" onClick={handleTogglePlay} aria-label="Toggle playback">
            {activeIsPlaying ? '⏸' : '▶'}
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
