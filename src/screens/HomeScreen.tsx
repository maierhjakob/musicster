import { useGame } from '../context/GameContext';
import './HomeScreen.css';

export default function HomeScreen() {
  const { dispatch } = useGame();

  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="logo">
          <span className="logo-music">&#9835;</span>
          <h1 className="logo-title">Musicster</h1>
          <p className="logo-subtitle">Place the hits in order</p>
        </div>

        <div className="home-actions">
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'START_GAME' })}>
            Play
          </button>
        </div>

        <p className="home-hint">How many songs can you place correctly?</p>
      </div>
    </div>
  );
}
