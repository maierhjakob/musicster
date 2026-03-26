import { useGame } from '../context/GameContext';
import './ResultScreen.css';

export default function ResultScreen() {
  const { state, dispatch } = useGame();
  const { timeline } = state;
  const placed = timeline.length - 1;

  return (
    <div className="result-screen">
      <div className="result-content">
        <div className="trophy">🏆</div>

        <h1 className="result-title">Game Over!</h1>

        <p className="result-sub">
          You correctly placed <strong>{placed}</strong> song{placed !== 1 ? 's' : ''} in your timeline
        </p>

        <div className="result-actions">
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'START_GAME' })}>
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
