import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { GENRES, type Genre } from '../data/songs';
import './HomeScreen.css';

export default function HomeScreen() {
  const { dispatch } = useGame();
  const { createRoom, joinRoom } = useMultiplayer();

  const [joinMode, setJoinMode] = useState<'none' | 'create' | 'join'>('none');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [goal, setGoal] = useState(8);
  const [genres, setGenres] = useState<Genre[]>([]);

  function toggleGenre(g: Genre) {
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  function handleCreate() {
    if (!playerName.trim()) return;
    createRoom(playerName.trim(), goal, genres);
  }

  function handleJoin() {
    if (!playerName.trim() || roomCode.length !== 4) return;
    joinRoom(roomCode, playerName.trim());
  }

  if (joinMode !== 'none') {
    return (
      <div className="home-screen">
        <div className="home-content">
          <h2 className="home-modal-title">{joinMode === 'create' ? 'Create game' : 'Join game'}</h2>

          <div className="home-modal-fields">
            <input
              className="home-input"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              autoFocus
            />

            {joinMode === 'create' && (
              <>
                <div className="home-genre-picker">
                  <button
                    className={`home-genre-btn ${genres.length === 0 ? 'active' : ''}`}
                    onClick={() => setGenres([])}
                  >All</button>
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      className={`home-genre-btn ${genres.includes(g) ? 'active' : ''}`}
                      onClick={() => toggleGenre(g)}
                    >{g}</button>
                  ))}
                </div>

                <label className="home-goal-label">
                  Win goal: {goal} correct
                  <input
                    type="range"
                    min={3}
                    max={20}
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value))}
                    className="home-goal-slider"
                  />
                </label>
              </>
            )}

            {joinMode === 'join' && (
              <input
                className="home-input home-input-code"
                placeholder="Room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
              />
            )}
          </div>

          <div className="home-actions">
            <button
              className="btn btn-primary"
              onClick={joinMode === 'create' ? handleCreate : handleJoin}
              disabled={!playerName.trim() || (joinMode === 'join' && roomCode.length !== 4)}
            >
              {joinMode === 'create' ? 'Create room' : 'Join'}
            </button>
            <button className="btn btn-secondary" onClick={() => setJoinMode('none')}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="logo">
          <span className="logo-music">&#9835;</span>
          <h1 className="logo-title">Musicster</h1>
          <p className="logo-subtitle">Place the hits in order</p>
        </div>

        <div className="home-genre-picker">
          <button
            className={`home-genre-btn ${genres.length === 0 ? 'active' : ''}`}
            onClick={() => setGenres([])}
          >All</button>
          {GENRES.map((g) => (
            <button
              key={g}
              className={`home-genre-btn ${genres.includes(g) ? 'active' : ''}`}
              onClick={() => toggleGenre(g)}
            >{g}</button>
          ))}
        </div>

        <div className="home-actions">
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'START_GAME', genres })}>
            Play solo
          </button>

          <div className="home-mp-row">
            <button className="btn btn-secondary" onClick={() => setJoinMode('create')}>
              Create game
            </button>
            <button className="btn btn-secondary" onClick={() => setJoinMode('join')}>
              Join game
            </button>
          </div>
        </div>

        <p className="home-hint">30s previews play automatically</p>
      </div>
    </div>
  );
}
