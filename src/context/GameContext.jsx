import { createContext, useContext, useReducer } from 'react';
import { songs, shuffle } from '../data/songs';

const GameContext = createContext(null);

const initialState = {
  screen: 'home',
  timeline: [],
  deck: [],
  currentCard: null,
  roundResult: null,
  showYear: false,
};

function gameReducer(state, action) {
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

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
