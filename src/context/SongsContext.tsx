import { createContext, useContext, useEffect, useState } from 'react';
import type { Song } from '../data/songs';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999';
const protocol = PARTYKIT_HOST.startsWith('localhost') ? 'http' : 'https';

const SongsContext = createContext<Song[]>([]);

export function SongsProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    fetch(`${protocol}://${PARTYKIT_HOST}/parties/main/songs`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSongs(data); })
      .catch(console.error);
  }, []);

  return <SongsContext.Provider value={songs}>{children}</SongsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSongs(): Song[] {
  return useContext(SongsContext);
}
