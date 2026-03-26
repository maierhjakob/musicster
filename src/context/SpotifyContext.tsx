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

    // Run search and device lookup in parallel
    const [searchRes, devicesRes] = await Promise.all([
      fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(`track:${title} artist:${artist}`)}&type=track&limit=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!searchRes.ok) return;
    const searchData = await searchRes.json();
    const uri: string | undefined = searchData.tracks?.items?.[0]?.uri;
    if (!uri) return;

    // Prefer active smartphone, then any smartphone, then active, then anything
    const devicesData = devicesRes.ok ? await devicesRes.json() : { devices: [] };
    const devices: Array<{ id: string; is_active: boolean; type: string; name: string }> =
      devicesData.devices ?? [];

    console.log('[Spotify] available devices:', devices.map(d => `${d.name} (${d.type}, active=${d.is_active})`));

    const device =
      devices.find(d => d.is_active && d.type === 'Smartphone') ??
      devices.find(d => d.type === 'Smartphone') ??
      devices.find(d => d.is_active && d.type === 'Computer') ??
      devices.find(d => d.is_active) ??
      devices[0];

    if (!device) {
      console.warn('[Spotify] no device found — open the Spotify app first');
      return;
    }

    console.log('[Spotify] playing on:', device.name, device.type);

    const playRes = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${device.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [uri] }),
      }
    );
    if (playRes.ok || playRes.status === 204) {
      setIsPlaying(true);
    } else {
      const err = await playRes.json().catch(() => ({}));
      console.error('[Spotify] play failed:', playRes.status, err);
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
