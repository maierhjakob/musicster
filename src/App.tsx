import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { GameProvider, useGame } from './context/GameContext';
import { SpotifyProvider, useSpotify } from './context/SpotifyContext';
import { exchangeCodeForToken } from './lib/spotifyAuth';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';

function AppRoutes() {
  const { state } = useGame();
  const { setToken } = useSpotify();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Native: catch the custom-scheme redirect from the external browser
      const listener = CapApp.addListener('appUrlOpen', ({ url }) => {
        const code = new URL(url).searchParams.get('code');
        if (code) {
          Browser.close();
          exchangeCodeForToken(code).then(setToken).catch(console.error);
        }
      });
      return () => { listener.then(l => l.remove()); };
    } else {
      // Web: code arrives as a query param after the redirect
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        window.history.replaceState({}, '', window.location.pathname);
        exchangeCodeForToken(code).then(setToken).catch(console.error);
      }
    }
  }, []);

  switch (state.screen) {
    case 'home':   return <HomeScreen />;
    case 'game':   return <GameScreen />;
    case 'result': return <ResultScreen />;
  }
}

export default function App() {
  return (
    <SpotifyProvider>
      <GameProvider>
        <AppRoutes />
      </GameProvider>
    </SpotifyProvider>
  );
}
