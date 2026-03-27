import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';
import { useMultiplayer } from '../context/MultiplayerContext';
import SongCard from '../components/SongCard';
import Timeline from '../components/Timeline';
import './MultiplayerGameScreen.css';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999';

export default function MultiplayerGameScreen() {
  const { state, placeCard, unplaceCard, leaveRoom } = useMultiplayer();
  const { currentCard, myTimeline, isTentative, myLastResult, waiting, players, goal, mode, allTimelines, playerName } = state;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewState, setPreviewState] = useState<{ cardId: number; playing: boolean } | null>(null);

  const hasPreview = previewState?.cardId === currentCard?.id;
  const isPreviewPlaying = hasPreview && (previewState?.playing ?? false);

  // Fetch and auto-play Deezer preview whenever the current card changes
  useEffect(() => {
    if (!currentCard) return;
    audioRef.current?.pause();
    audioRef.current = null;

    let cancelled = false;
    const cardId = currentCard.id;
    const q = encodeURIComponent(`"${currentCard.title}" "${currentCard.artist}"`);
    const deezerFetch = Capacitor.isNativePlatform()
      ? CapacitorHttp.get({ url: `https://api.deezer.com/search?q=${q}&limit=1` }).then((r) => r.data)
      : import.meta.env.DEV
        ? fetch(`/deezer-api/search?q=${q}&limit=1`).then((r) => r.json())
        : fetch(`https://${PARTYKIT_HOST}/parties/main/proxy?q=${q}&limit=1`).then((r) => r.json());

    deezerFetch
      .then((d) => {
        if (cancelled) return;
        const url: string | undefined = d.data?.[0]?.preview;
        if (!url) return;
        const audio = new Audio(url);
        audioRef.current = audio;
        setPreviewState({ cardId, playing: false });
        audio.addEventListener('play', () => setPreviewState({ cardId, playing: true }));
        audio.addEventListener('pause', () => setPreviewState((s) => s?.cardId === cardId ? { cardId, playing: false } : s));
        audio.addEventListener('ended', () => setPreviewState((s) => s?.cardId === cardId ? { cardId, playing: false } : s));
        audio.play().catch(() => {});
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      audioRef.current?.pause();
      audioRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCard?.id]);

  function handleTogglePlay() {
    if (!audioRef.current) return;
    if (isPreviewPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }

  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const showReveal = mode === 'reveal';

  // Index of the tentative card in myTimeline (-1 if none)
  const tentativeIndex = isTentative && currentCard
    ? myTimeline.findIndex((s) => s.id === currentCard.id)
    : -1;

  // Other players' timelines from last reveal (empty before first reveal)
  const otherTimelines = allTimelines.filter((t) => t.player !== playerName);

  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
    setDragPos({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (showReveal) return;
    startDrag(e);
  }

  function handleTentativeDragStart(e: React.PointerEvent<HTMLDivElement>) {
    if (showReveal) return;
    startDrag(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const cardEl = elements.find(
      (el) => el instanceof HTMLElement && el.dataset.cardIndex !== undefined
    ) as HTMLElement | undefined;
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      const cardIndex = parseInt(cardEl.dataset.cardIndex!);
      const isLeftHalf = e.clientX < rect.left + rect.width / 2;
      setHoveredSlot(isLeftHalf ? cardIndex : cardIndex + 1);
    } else {
      const inTimeline = elements.some(
        (el) => el instanceof HTMLElement && el.classList.contains('timeline')
      );
      if (inTimeline) {
        const cardEls = Array.from(document.querySelectorAll<HTMLElement>('[data-card-index]'));
        let slot = 0;
        for (const c of cardEls) {
          const rect = c.getBoundingClientRect();
          if (e.clientX > rect.left + rect.width / 2) slot = parseInt(c.dataset.cardIndex!) + 1;
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
    if (hoveredSlot === null) {
      // Dropped outside timeline — return card to hand if it was tentative
      if (isTentative) unplaceCard();
    } else {
      // Don't place if slot would leave the card in the same position
      const samePos = tentativeIndex !== -1 &&
        (hoveredSlot === tentativeIndex || hoveredSlot === tentativeIndex + 1);
      if (!samePos) placeCard(hoveredSlot);
    }
    setHoveredSlot(null);
  }

  return (
    <div className="mp-game-screen" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {/* Top bar */}
      <div className="game-topbar">
        <button className="btn-back" onClick={leaveRoom}>✕</button>
      </div>

      {/* Current card — hidden while tentative (card lives in the timeline) */}
      <div className="card-area">
        <p className="card-area-label">
          {showReveal
            ? myLastResult === 'correct'
              ? '✅ Correct!'
              : '❌ Wrong!'
            : isTentative && waiting.length > 0
              ? `Waiting for ${waiting.join(', ')}… · drag in timeline to reposition`
              : isTentative
                ? 'Placed — waiting for all players'
                : 'Drag this song into your timeline'}
        </p>

        {!isTentative && (
          <div
            className={`card-draggable ${dragging ? 'is-dragging' : ''} ${showReveal ? 'no-drag' : ''}`}
            onPointerDown={handlePointerDown}
          >
            <SongCard song={currentCard} revealed={showReveal} />
          </div>
        )}

        {hasPreview && (
          <button className="btn-play-pause" onClick={handleTogglePlay} aria-label="Toggle playback">
            {isPreviewPlaying ? '⏸' : '▶'}
          </button>
        )}
      </div>

      {/* Ghost card */}
      {dragging && <div className="card-ghost" style={{ left: dragPos.x - 45, top: dragPos.y - 31 }} />}

      {/* My timeline */}
      <div className="timeline-area">
        <p className="timeline-label">
          Your timeline
          <span className="timeline-count"> ({myTimeline.length} cards)</span>
        </p>
        <Timeline
          cards={myTimeline}
          hoveredSlot={dragging ? hoveredSlot : null}
          disabled={showReveal}
          newCardId={myLastResult === 'correct' && showReveal ? (currentCard?.id ?? null) : null}
          tentativeCardId={isTentative ? (currentCard?.id ?? null) : null}
          tentativeIndex={tentativeIndex === -1 ? undefined : tentativeIndex}
          onTentativeDragStart={handleTentativeDragStart}
        />
      </div>

      {/* Other players' timelines (always visible, updated after each reveal) */}
      {otherTimelines.length > 0 && (
        <div className="mp-other-timelines">
          {otherTimelines.map((entry) => (
            <div key={entry.player} className="mp-other-player">
              <p className="mp-other-label">
                {entry.player}
                <span className="mp-other-score"> · {entry.correctCount}/{goal}</span>
              </p>
              <div className="mp-mini-timeline-row">
                {entry.timeline.map((song, i) => {
                  const isStarting = i === 0;
                  const correct = isStarting || entry.timeline[i - 1].year <= song.year;
                  return (
                    <div
                      key={song.id}
                      className={`mp-mini-card-sm ${isStarting ? 'starting' : correct ? 'correct' : 'wrong'}`}
                    >
                      <span className="mp-mini-artist-sm">{song.artist}</span>
                      <span className="mp-mini-year-sm">{song.year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
