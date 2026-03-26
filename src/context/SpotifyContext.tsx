import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  getStoredToken,
  clearStoredTokens,
  refreshAccessToken,
} from '../lib/spotifyAuth';

interface SpotifyContextValue {
  token: string | null;
  setToken: (token: string) => void;
  isConnected: boolean;
  isPlaying: boolean;
  disconnect: () => void;
  playTrack: (title: string, artist: string) => Promise<void>;
  togglePlay: () => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextValue | null>(null);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getStoredToken);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!token) {
      refreshAccessToken().then(t => { if (t) setTokenState(t); });
    }
  }, []);

  function setToken(t: string) {
    setTokenState(t);
  }

  function disconnect() {
    setIsPlaying(false);
    setTokenState(null);
    clearStoredTokens();
  }

  async function playTrack(title: string, artist: string) {
    if (!token) return;

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(`track:${title} artist:${artist}`)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!searchRes.ok) return;
    const searchData = await searchRes.json();
    const uri: string | undefined = searchData.tracks?.items?.[0]?.uri;
    if (!uri) return;

    // No device_id — targets whatever is currently active in Spotify, no device switching
    const playRes = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [uri] }),
    });
    if (playRes.ok || playRes.status === 204) {
      setIsPlaying(true);
    }
  }

  async function togglePlay() {
    if (!token) return;

    if (isPlaying) {
      await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPlaying(false);
    } else {
      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPlaying(true);
    }
  }

  return (
    <SpotifyContext.Provider
      value={{
        token,
        setToken,
        isConnected: !!token,
        isPlaying,
        disconnect,
        playTrack,
        togglePlay,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify(): SpotifyContextValue {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error('useSpotify must be used within SpotifyProvider');
  return ctx;
}
