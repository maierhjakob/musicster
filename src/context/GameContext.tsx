import { createContext, useCallback, useContext, useReducer, type Dispatch } from 'react';
import { shuffle, type Song } from '../data/songs';
import { useSongs } from './SongsContext';

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

// Internal action includes the pre-shuffled deck so the reducer stays pure
type InternalAction =
  | { type: '_START'; deck: Song[] }
  | { type: 'PLACE_CARD'; position: number }
  | { type: 'NEXT_CARD' }
  | { type: 'GO_HOME' };

// Public action surface — callers just dispatch START_GAME with no args
export type GameAction =
  | { type: 'START_GAME'; genre?: string | null }
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

function gameReducer(state: GameState, action: InternalAction): GameState {
  switch (action.type) {
    case '_START': {
      const { deck } = action;
      return {
        ...initialState,
        screen: 'game',
        timeline: [deck[0]],
        deck: deck.slice(2),
        currentCard: deck[1],
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
  const songs = useSongs();
  const [state, internalDispatch] = useReducer(gameReducer, initialState);

  const dispatch = useCallback((action: GameAction) => {
    if (action.type === 'START_GAME') {
      const pool = action.genre ? songs.filter((s) => s.genre === action.genre) : songs;
      internalDispatch({ type: '_START', deck: shuffle(pool) });
    } else {
      internalDispatch(action);
    }
  }, [songs]);

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
