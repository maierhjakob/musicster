import { createContext, useContext, useReducer, type Dispatch } from 'react';
import { songs, shuffle, type Song } from '../data/songs';

type Screen = 'home' | 'game' | 'result';
type RoundResult = 'correct' | 'wrong' | null;

interface GameState {
  screen: Screen;
  timeline: Song[];
  deck: Song[];
  currentCard: Song | null;
  roundResult: RoundResult;
  showYear: boolean;
}

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PLACE_CARD'; position: number }
  | { type: 'NEXT_CARD' }
  | { type: 'GO_HOME' };

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

const initialState: GameState = {
  screen: 'home',
  timeline: [],
  deck: [],
  currentCard: null,
  roundResult: null,
  showYear: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const deck = shuffle(songs);
      const startingCard = deck[0];
      const firstCard = deck[1];
      return {
        ...initialState,
        screen: 'game',
        timeline: [startingCard],
        deck: deck.slice(2),
        currentCard: firstCard,
      };
    }

    case 'PLACE_CARD': {
      const { position } = action;
      const { timeline, currentCard } = state;
      if (!currentCard) return state;
      const newTimeline = [...timeline];
      newTimeline.splice(position, 0, currentCard);
      const correct = newTimeline.every(
        (s, i) => i === 0 || newTimeline[i - 1].year <= s.year
      );
      return {
        ...state,
        timeline: correct ? newTimeline : timeline,
        roundResult: correct ? 'correct' : 'wrong',
        showYear: true,
      };
    }

    case 'NEXT_CARD': {
      const { deck } = state;
      if (deck.length === 0) {
        return { ...state, screen: 'result' };
      }
      return {
        ...state,
        deck: deck.slice(1),
        currentCard: deck[0],
        roundResult: null,
        showYear: false,
      };
    }

    case 'GO_HOME':
      return { ...initialState };
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
