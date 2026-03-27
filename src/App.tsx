import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { SongsProvider, useSongs } from './context/SongsContext';
import { GameProvider, useGame } from './context/GameContext';
import { SpotifyProvider, useSpotify } from './context/SpotifyContext';
import { MultiplayerProvider, useMultiplayer } from './context/MultiplayerContext';
import { exchangeCodeForToken } from './lib/spotifyAuth';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import LobbyScreen from './screens/LobbyScreen';
import MultiplayerGameScreen from './screens/MultiplayerGameScreen';
import MultiplayerResultScreen from './screens/MultiplayerResultScreen';

function AppRoutes() {
  const songs = useSongs();
  const { state } = useGame();
  const { setToken } = useSpotify();
  const { state: mpState } = useMultiplayer();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listener = CapApp.addListener('appUrlOpen', ({ url }) => {
        const code = new URL(url).searchParams.get('code');
        if (code) {
          Browser.close();
          exchangeCodeForToken(code).then(setToken).catch(console.error);
        }
      });
      return () => { listener.then(l => l.remove()); };
    } else {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        window.history.replaceState({}, '', window.location.pathname);
        exchangeCodeForToken(code).then(setToken).catch(console.error);
      }
    }
  }, []);

  if (songs.length === 0) return null;

  // Multiplayer screens take priority over solo routing
  if (mpState.mode === 'lobby') return <LobbyScreen />;
  if (mpState.mode === 'game' || mpState.mode === 'reveal') return <MultiplayerGameScreen />;
  if (mpState.mode === 'result') return <MultiplayerResultScreen />;

  switch (state.screen) {
    case 'home':   return <HomeScreen />;
    case 'game':   return <GameScreen />;
    case 'result': return <ResultScreen />;
  }
}

export default function App() {
  return (
    <SongsProvider>
      <SpotifyProvider>
        <GameProvider>
          <MultiplayerProvider>
            <AppRoutes />
          </MultiplayerProvider>
        </GameProvider>
      </SpotifyProvider>
    </SongsProvider>
  );
}
