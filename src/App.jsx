import { GameProvider, useGame } from './context/GameContext';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';

function AppRoutes() {
  const { state } = useGame();

  switch (state.screen) {
    case 'home':   return <HomeScreen />;
    case 'game':   return <GameScreen />;
    case 'result': return <ResultScreen />;
    default:       return <HomeScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <AppRoutes />
    </GameProvider>
  );
}
