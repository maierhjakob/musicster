import { useGame } from '../context/GameContext';
import SongCard from '../components/SongCard';
import Timeline from '../components/Timeline';
import './GameScreen.css';

const COLORS = ['#e94560', '#0f3460', '#533483', '#05c46b', '#ffd32a', '#ff5e57'];

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const { players, currentPlayerIndex, currentCard, roundResult, showYear, deck } = state;
  const currentPlayer = players[currentPlayerIndex];

  function handlePlace(position) {
    dispatch({ type: 'PLACE_CARD', position });
  }

  function handleNext() {
    dispatch({ type: 'NEXT_TURN' });
  }

  return (
    <div className="game-screen">
      {/* Top bar */}
      <div className="game-topbar">
        <button className="btn-back" onClick={() => dispatch({ type: 'GO_HOME' })}>✕</button>
        <div className="turn-indicator" style={{ color: COLORS[currentPlayerIndex] }}>
          {currentPlayer.name}'s turn
        </div>
        <div className="deck-count">{deck.length} left</div>
      </div>

      {/* Current card */}
      <div className="card-area">
        <p className="card-area-label">
          {showYear ? (
            roundResult === 'correct'
              ? '✅ Correct! It was…'
              : '❌ Wrong! It was…'
          ) : 'Where does this song fit?'}
        </p>

        <SongCard song={currentCard} revealed={showYear} />

        {!showYear && (
          <p className="card-hint">Tap a slot in your timeline below</p>
        )}
      </div>

      {/* Timeline */}
      <div className="timeline-area">
        <p className="timeline-label">
          {currentPlayer.name}'s timeline
          <span className="timeline-count"> ({currentPlayer.timeline.length} cards)</span>
        </p>
        <Timeline
          cards={currentPlayer.timeline}
          onPlace={handlePlace}
          disabled={showYear}
        />
      </div>

      {/* Footer */}
      {showYear && (
        <div className="game-footer">
          <div className={`result-banner ${roundResult}`}>
            {roundResult === 'correct'
              ? `+1 card for ${currentPlayer.name}!`
              : `No card for ${currentPlayer.name} this round`}
          </div>
          <button className="btn btn-primary" onClick={handleNext}>
            Next player →
          </button>
        </div>
      )}

      {/* Scoreboard pill */}
      <div className="scoreboard">
        {players.map((p, i) => (
          <div
            key={i}
            className={`score-pill ${i === currentPlayerIndex ? 'active' : ''}`}
            style={{ borderColor: COLORS[i] }}
          >
            <span className="score-name">{p.name}</span>
            <span className="score-count" style={{ color: COLORS[i] }}>{p.timeline.length}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
