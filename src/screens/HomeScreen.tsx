import { useGame } from '../context/GameContext';
import { useSpotify } from '../context/SpotifyContext';
import { redirectToSpotifyAuth } from '../lib/spotifyAuth';
import './HomeScreen.css';

export default function HomeScreen() {
  const { dispatch } = useGame();
  const { token, isConnected, disconnect } = useSpotify();

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

          {token ? (
            <button className="btn btn-secondary spotify-btn spotify-connected" onClick={disconnect}>
              <span className="spotify-dot" />
              {isConnected ? 'Spotify connected' : 'Spotify connecting…'}
            </button>
          ) : (
            <button className="btn btn-secondary spotify-btn" onClick={redirectToSpotifyAuth}>
              Connect Spotify
            </button>
          )}
        </div>

        <p className="home-hint">How many songs can you place correctly?</p>
      </div>
    </div>
  );
}
