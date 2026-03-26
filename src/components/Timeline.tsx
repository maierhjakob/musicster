import { Fragment } from 'react';
import type { Song } from '../data/songs';
import './Timeline.css';

interface TimelineProps {
  cards: Song[];
  hoveredSlot: number | null;
  disabled: boolean;
  newCardId: number | null;
  tentativeCardId?: number | null;
  tentativeIndex?: number;
  onTentativeDragStart?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export default function Timeline({
  cards,
  hoveredSlot,
  disabled,
  newCardId,
  tentativeCardId,
  tentativeIndex,
  onTentativeDragStart,
}: TimelineProps) {
  // A slot is "same position" as the tentative card if it would result in no movement
  function isBlockedSlot(slot: number) {
    if (tentativeIndex === undefined || tentativeIndex === -1) return false;
    return slot === tentativeIndex || slot === tentativeIndex + 1;
  }

  return (
    <div className="timeline">
      {cards.map((card, i) => {
        const isTentative = card.id === tentativeCardId;
        return (
          <Fragment key={card.id}>
            {hoveredSlot === i && !disabled && !isBlockedSlot(i) && <div className="timeline-card-preview" />}
            <div
              className={`timeline-card ${card.id === newCardId ? 'pop-in' : ''} ${isTentative ? 'tentative' : ''}`}
              data-card-index={i}
              onPointerDown={isTentative && onTentativeDragStart ? onTentativeDragStart : undefined}
            >
              {isTentative ? (
                <>
                  <span className="tc-year tc-year-hidden">?</span>
                  <span className="tc-title tc-year-hidden">?</span>
                </>
              ) : (
                <>
                  <span className="tc-year">{card.year}</span>
                  <span className="tc-title">{card.title}</span>
                  <span className="tc-artist">{card.artist}</span>
                </>
              )}
            </div>
          </Fragment>
        );
      })}
      {hoveredSlot === cards.length && !disabled && !isBlockedSlot(cards.length) && <div className="timeline-card-preview" />}
    </div>
  );
}
