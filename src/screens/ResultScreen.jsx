import { useGame } from '../context/GameContext';
import './ResultScreen.css';

const COLORS = ['#e94560', '#0f3460', '#533483', '#05c46b', '#ffd32a', '#ff5e57'];

export default function ResultScreen() {
  const { state, dispatch } = useGame();
  const { players } = state;

  const sorted = [...players].sort((a, b) => b.timeline.length - a.timeline.length);
  const winner = sorted[0];
  const isTie = sorted.length > 1 && sorted[0].timeline.length === sorted[1].timeline.length;

  return (
    <div className="result-screen">
      <div className="result-content">
        <div className="trophy">🏆</div>

        <h1 className="result-title">
          {isTie ? "It's a tie!" : `${winner.name} wins!`}
        </h1>

        <p className="result-sub">
          {isTie
            ? `${sorted.filter(p => p.timeline.length === winner.timeline.length).map(p => p.name).join(' & ')} tied with ${winner.timeline.length} cards`
            : `${winner.timeline.length} cards placed correctly`}
        </p>

        <div className="result-list">
          {sorted.map((player, i) => {
            const originalIndex = players.findIndex(p => p.name === player.name);
            return (
              <div key={player.name} className="result-row" style={{ borderLeftColor: COLORS[originalIndex] }}>
                <span className="result-rank">#{i + 1}</span>
                <span className="result-player-name">{player.name}</span>
                <span className="result-score" style={{ color: COLORS[originalIndex] }}>
                  {player.timeline.length}
                </span>
              </div>
            );
          })}
        </div>

        <div className="result-actions">
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'START_SETUP' })}>
            Play Again
          </button>
          <button className="btn btn-secondary" onClick={() => dispatch({ type: 'GO_HOME' })}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
