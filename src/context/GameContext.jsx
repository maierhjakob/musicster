import { createContext, useContext, useReducer } from 'react';
import { songs, shuffle } from '../data/songs';

const GameContext = createContext(null);

const CARDS_PER_PLAYER_START = 1;

function createPlayer(name) {
  return { name, timeline: [] };
}

const initialState = {
  screen: 'home', // 'home' | 'setup' | 'game' | 'result'
  players: [],
  currentPlayerIndex: 0,
  deck: [],
  currentCard: null,
  roundResult: null, // 'correct' | 'wrong'
  showYear: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_SETUP':
      return { ...state, screen: 'setup' };

    case 'START_GAME': {
      const deck = shuffle(songs);
      const firstCard = deck[0];
      return {
        ...state,
        screen: 'game',
        players: action.players.map(createPlayer),
        currentPlayerIndex: 0,
        deck: deck.slice(1),
        currentCard: firstCard,
        roundResult: null,
        showYear: false,
      };
    }

    case 'PLACE_CARD': {
      const { position } = action;
      const { players, currentPlayerIndex, currentCard, deck } = state;
      const player = players[currentPlayerIndex];

      // Build the new timeline with the card inserted
      const newTimeline = [...player.timeline];
      newTimeline.splice(position, 0, currentCard);

      // Check if placement is correct (sorted by year)
      const correct = newTimeline.every(
        (s, i) => i === 0 || newTimeline[i - 1].year <= s.year
      );

      const updatedPlayers = players.map((p, i) => {
        if (i !== currentPlayerIndex) return p;
        return { ...p, timeline: correct ? newTimeline : p.timeline };
      });

      return {
        ...state,
        players: updatedPlayers,
        roundResult: correct ? 'correct' : 'wrong',
        showYear: true,
      };
    }

    case 'NEXT_TURN': {
      const { deck, players } = state;
      if (deck.length === 0) {
        return { ...state, screen: 'result' };
      }
      const nextCard = deck[0];
      const nextDeck = deck.slice(1);
      const nextPlayer = (state.currentPlayerIndex + 1) % players.length;
      return {
        ...state,
        deck: nextDeck,
        currentCard: nextCard,
        currentPlayerIndex: nextPlayer,
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
