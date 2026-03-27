import { useMultiplayer } from '../context/MultiplayerContext';
import { GENRES } from '../data/songs';
import './LobbyScreen.css';

export default function LobbyScreen() {
  const { state, startGame, setGoal, setGenres, leaveRoom } = useMultiplayer();

  function toggleGenre(g: string) {
    const next = state.genres.includes(g)
      ? state.genres.filter((x) => x !== g)
      : [...state.genres, g];
    setGenres(next);
  }
  function handleGoalChange(val: string) {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 1 && n <= 30) setGoal(n);
  }

  return (
    <div className="lobby-screen">
      <button className="btn-back" onClick={leaveRoom}>✕</button>

      <div className="lobby-content">
        <p className="lobby-label">Room code</p>
        <h1 className="lobby-code">{state.roomCode}</h1>
        <p className="lobby-hint">Share this code with friends</p>

        <div className="lobby-players">
          {state.players.map((p) => (
            <div key={p.name} className="lobby-player">
              <span className="lobby-player-name">{p.name}</span>
              {p.isHost && <span className="lobby-host-badge">host</span>}
            </div>
          ))}
        </div>

        {state.isHost ? (
          <div className="lobby-settings">
            <div className="lobby-genre-picker">
              <button
                className={`lobby-genre-btn ${state.genres.length === 0 ? 'active' : ''}`}
                onClick={() => setGenres([])}
              >All</button>
              {GENRES.map((g) => (
                <button
                  key={g}
                  className={`lobby-genre-btn ${state.genres.includes(g) ? 'active' : ''}`}
                  onClick={() => toggleGenre(g)}
                >{g}</button>
              ))}
            </div>

            <label className="lobby-setting-label">
              Win goal
              <div className="lobby-goal-row">
                <button
                  className="lobby-goal-btn"
                  onClick={() => handleGoalChange(String(Math.max(1, state.goal - 1)))}
                >−</button>
                <span className="lobby-goal-value">{state.goal}</span>
                <button
                  className="lobby-goal-btn"
                  onClick={() => handleGoalChange(String(Math.min(30, state.goal + 1)))}
                >+</button>
              </div>
              <span className="lobby-goal-hint">correct placements to win</span>
            </label>

            <button
              className="btn btn-primary"
              onClick={startGame}
              disabled={state.players.length < 2}
            >
              {state.players.length < 2 ? 'Waiting for players…' : 'Start game'}
            </button>
          </div>
        ) : (
          <>
            <p className="lobby-genre-display">
              Genre: <strong>{state.genres.length === 0 ? 'All' : state.genres.join(', ')}</strong>
            </p>
            <p className="lobby-waiting">Waiting for the host to start…</p>
          </>
        )}
      </div>
    </div>
  );
}
