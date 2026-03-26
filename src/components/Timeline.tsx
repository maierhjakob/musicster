import { Fragment } from 'react';
import type { Song } from '../data/songs';
import './Timeline.css';

interface TimelineProps {
  cards: Song[];
  hoveredSlot: number | null;
  disabled: boolean;
  newCardId: number | null;
}

export default function Timeline({ cards, hoveredSlot, disabled, newCardId }: TimelineProps) {
  return (
    <div className="timeline">
      {cards.map((card, i) => (
        <Fragment key={card.id}>
          {hoveredSlot === i && !disabled && (
            <div className="timeline-card-preview" />
          )}
          <div
            className={`timeline-card ${card.id === newCardId ? 'pop-in' : ''}`}
            data-card-index={i}
          >
            <span className="tc-year">{card.year}</span>
            <span className="tc-title">{card.title}</span>
            <span className="tc-artist">{card.artist}</span>
          </div>
        </Fragment>
      ))}
      {hoveredSlot === cards.length && !disabled && (
        <div className="timeline-card-preview" />
      )}
    </div>
  );
}
