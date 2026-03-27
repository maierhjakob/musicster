import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import PartySocket from 'partysocket';
import type { Song } from '../data/songs';
import { useSongs } from './SongsContext';


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlayerInfo {
  name: string;
  correctCount: number;
  isHost: boolean;
}

export interface TimelineEntry {
  player: string;
  timeline: Song[];
  correctCount: number;
}

type MpMode = 'idle' | 'lobby' | 'game' | 'reveal' | 'result';

export interface MultiplayerState {
  mode: MpMode;
  roomCode: string;
  playerName: string;
  isHost: boolean;
  players: PlayerInfo[];
  goal: number;
  genres: string[];

  // Game
  currentCard: Song | null;
  myTimeline: Song[];
  isTentative: boolean;   // currentCard is currently shown in myTimeline (can still be repositioned)
  myLastResult: 'correct' | 'wrong' | null;
  waiting: string[];

  // Reveal / result
  allTimelines: TimelineEntry[];
  winner: string | null;
}

type MpAction =
  | { type: 'SET_LOBBY'; roomCode: string; playerName: string; isHost: boolean; goal: number }
  | { type: 'ROOM_STATE'; players: PlayerInfo[]; goal: number; genres: string[] }
  | { type: 'GAME_STARTED'; startingCard: Song; firstCard: Song; goal: number }
  | { type: 'CARD_DEALT'; card: Song }
  | { type: 'PLACE_CARD'; position: number }
  | { type: 'UNPLACE_CARD' }
  | { type: 'PLAYER_PLACED'; waiting: string[] }
  | { type: 'REVEAL'; allTimelines: TimelineEntry[] }
  | { type: 'GAME_OVER'; winner: string | null; allTimelines: TimelineEntry[] }
  | { type: 'PLAY_AGAIN' }
  | { type: 'RESET' };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999';


function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const initialState: MultiplayerState = {
  mode: 'idle',
  roomCode: '',
  playerName: '',
  isHost: false,
  players: [],
  goal: 8,
  genres: [],
  currentCard: null,
  myTimeline: [],
  isTentative: false,
  myLastResult: null,
  waiting: [],
  allTimelines: [],
  winner: null,
};

function mpReducer(state: MultiplayerState, action: MpAction): MultiplayerState {
  switch (action.type) {
    case 'SET_LOBBY':
      return {
        ...initialState,
        mode: 'lobby',
        roomCode: action.roomCode,
        playerName: action.playerName,
        isHost: action.isHost,
        goal: action.goal,
      };

    case 'ROOM_STATE':
      return {
        ...state,
        players: action.players,
        goal: action.goal,
        genres: action.genres,
        isHost: action.players.find((p) => p.name === state.playerName)?.isHost ?? state.isHost,
      };

    case 'GAME_STARTED':
      return {
        ...state,
        mode: 'game',
        goal: action.goal,
        myTimeline: [action.startingCard],
        currentCard: action.firstCard,
        isTentative: false,
        myLastResult: null,
        waiting: [],
        allTimelines: [],
        winner: null,
      };

    case 'CARD_DEALT':
      return {
        ...state,
        mode: 'game',
        currentCard: action.card,
        isTentative: false,
        myLastResult: null,
        waiting: [],
      };

    case 'PLACE_CARD': {
      if (!state.currentCard) return state;
      // Remove current card from timeline if it was already tentatively placed
      const base = state.isTentative
        ? state.myTimeline.filter((s) => s.id !== state.currentCard!.id)
        : state.myTimeline;
      const newTimeline = [...base];
      newTimeline.splice(action.position, 0, state.currentCard);
      return {
        ...state,
        myTimeline: newTimeline,
        isTentative: true,
      };
    }

    case 'UNPLACE_CARD': {
      if (!state.currentCard) return state;
      return {
        ...state,
        myTimeline: state.myTimeline.filter((s) => s.id !== state.currentCard!.id),
        isTentative: false,
      };
    }

    case 'PLAYER_PLACED':
      return { ...state, waiting: action.waiting };

    case 'REVEAL': {
      // Sync myTimeline with server's authoritative result
      const myEntry = action.allTimelines.find((t) => t.player === state.playerName);
      const myTimeline = myEntry?.timeline ?? state.myTimeline;
      const correct = state.currentCard ? myTimeline.some((s) => s.id === state.currentCard!.id) : false;
      return {
        ...state,
        mode: 'reveal',
        myTimeline,
        myLastResult: correct ? 'correct' : 'wrong',
        isTentative: false,
        allTimelines: action.allTimelines,
      };
    }

    case 'GAME_OVER':
      return {
        ...state,
        mode: 'result',
        winner: action.winner,
        allTimelines: action.allTimelines,
      };

    case 'PLAY_AGAIN':
      return {
        ...state,
        mode: 'lobby',
        currentCard: null,
        myTimeline: [],
        isTentative: false,
        myLastResult: null,
        waiting: [],
        allTimelines: [],
        winner: null,
      };

    case 'RESET':
      return initialState;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface MultiplayerContextValue {
  state: MultiplayerState;
  createRoom: (playerName: string, goal: number, genres?: string[]) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  setGoal: (goal: number) => void;
  setGenres: (genres: string[]) => void;
  placeCard: (position: number) => void;
  unplaceCard: () => void;
  playAgain: () => void;
  leaveRoom: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const songs = useSongs();
  const songsRef = useRef(songs);
  songsRef.current = songs;
  const songById = (id: number): Song | undefined => songsRef.current.find((s) => s.id === id);

  const [state, dispatch] = useReducer(mpReducer, initialState);
  const socketRef = useRef<PartySocket | null>(null);
  const pendingPlaceRef = useRef<{ position: number; correct: boolean } | null>(null);

  function connect(roomCode: string, playerName: string, goal: number, isHost: boolean, genres: string[] = []) {
    socketRef.current?.close();

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomCode,
    });

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ type: 'join', playerName, goal, genres }));
    });

    socket.addEventListener('message', (e: MessageEvent) => {
      const msg = JSON.parse(e.data as string);
      handleServerMessage(msg);
    });

    socketRef.current = socket;
    dispatch({ type: 'SET_LOBBY', roomCode, playerName, isHost, goal });
  }

  function handleServerMessage(msg: Record<string, unknown>) {
    switch (msg.type) {
      case 'room_state':
        dispatch({
          type: 'ROOM_STATE',
          players: msg.players as PlayerInfo[],
          goal: msg.goal as number,
          genres: (msg.genres as string[]) ?? [],
        });
        break;

      case 'game_started': {
        const startingCard = songById(msg.startingCardId as number);
        const firstCard = songById(msg.firstCardId as number);
        if (!startingCard || !firstCard) return;
        dispatch({
          type: 'GAME_STARTED',
          startingCard,
          firstCard,
          goal: msg.goal as number,
        });
        break;
      }

      case 'card_dealt': {
        const card = songById(msg.cardId as number);
        if (!card) return;
        dispatch({ type: 'CARD_DEALT', card });
        break;
      }

      case 'player_placed':
        dispatch({ type: 'PLAYER_PLACED', waiting: msg.waiting as string[] });
        break;

      case 'reveal': {
        const allTimelines = (msg.timelines as { player: string; timeline: number[]; correctCount: number }[]).map(
          (t) => ({
            player: t.player,
            timeline: t.timeline.map((id) => songById(id)!).filter(Boolean),
            correctCount: t.correctCount,
          })
        );
        dispatch({ type: 'REVEAL', allTimelines });
        break;
      }

      case 'game_over': {
        const allTimelines = (msg.timelines as { player: string; timeline: number[]; correctCount: number }[]).map(
          (t) => ({
            player: t.player,
            timeline: t.timeline.map((id) => songById(id)!).filter(Boolean),
            correctCount: t.correctCount,
          })
        );
        dispatch({ type: 'GAME_OVER', winner: (msg.winner as string) ?? null, allTimelines });
        break;
      }
    }
  }

  const createRoom = useCallback((playerName: string, goal: number, genres?: string[]) => {
    const roomCode = generateRoomCode();
    connect(roomCode, playerName, goal, true, genres ?? []);
  }, []);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    connect(roomCode.toUpperCase(), playerName, 8, false);
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.send(JSON.stringify({ type: 'start_game' }));
  }, []);

  const setGoal = useCallback((goal: number) => {
    socketRef.current?.send(JSON.stringify({ type: 'set_goal', goal }));
  }, []);

  const setGenres = useCallback((genres: string[]) => {
    socketRef.current?.send(JSON.stringify({ type: 'set_genres', genres }));
  }, []);

  const placeCard = useCallback(
    (position: number) => {
      dispatch({ type: 'PLACE_CARD', position });
      socketRef.current?.send(JSON.stringify({ type: 'place_card', position }));
    },
    []
  );

  const unplaceCard = useCallback(() => {
    dispatch({ type: 'UNPLACE_CARD' });
    socketRef.current?.send(JSON.stringify({ type: 'unplace_card' }));
  }, []);

  const playAgain = useCallback(() => {
    dispatch({ type: 'PLAY_AGAIN' });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  // Suppress unused ref warning
  void pendingPlaceRef;

  return (
    <MultiplayerContext.Provider value={{ state, createRoom, joinRoom, startGame, setGoal, setGenres, placeCard, unplaceCard, playAgain, leaveRoom }}>
      {children}
    </MultiplayerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMultiplayer(): MultiplayerContextValue {
  const ctx = useContext(MultiplayerContext);
  if (!ctx) throw new Error('useMultiplayer must be used within MultiplayerProvider');
  return ctx;
}
