import { useState } from 'react';
import { useGame } from '../context/GameContext';
import './SetupScreen.css';

const COLORS = ['#e94560', '#0f3460', '#533483', '#05c46b', '#ffd32a', '#ff5e57'];

export default function SetupScreen() {
  const { dispatch } = useGame();
  const [players, setPlayers] = useState(['Player 1', 'Player 2']);
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  function addPlayer() {
    if (players.length >= 6) return;
    setPlayers([...players, `Player ${players.length + 1}`]);
  }

  function removePlayer(index) {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== index));
  }

  function startEdit(index) {
    setEditingIndex(index);
    setInputValue(players[index]);
  }

  function commitEdit() {
    if (editingIndex === null) return;
    const trimmed = inputValue.trim();
    if (trimmed) {
      const updated = [...players];
      updated[editingIndex] = trimmed;
      setPlayers(updated);
    }
    setEditingIndex(null);
    setInputValue('');
  }

  function startGame() {
    dispatch({ type: 'START_GAME', players });
  }

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <button className="btn-back" onClick={() => dispatch({ type: 'GO_HOME' })}>← Back</button>
        <h2>Players</h2>
      </div>

      <div className="player-list">
        {players.map((name, i) => (
          <div key={i} className="player-row" style={{ borderLeftColor: COLORS[i] }}>
            {editingIndex === i ? (
              <input
                className="player-input"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => e.key === 'Enter' && commitEdit()}
                autoFocus
              />
            ) : (
              <span className="player-name" onClick={() => startEdit(i)}>{name}</span>
            )}
            <button
              className="btn-remove"
              onClick={() => removePlayer(i)}
              disabled={players.length <= 2}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {players.length < 6 && (
        <button className="btn btn-secondary add-player-btn" onClick={addPlayer}>
          + Add Player
        </button>
      )}

      <div className="setup-footer">
        <button className="btn btn-primary" onClick={startGame}>
          Start Game
        </button>
      </div>
    </div>
  );
}
