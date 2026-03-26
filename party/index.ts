import type * as Party from 'partykit/server';
import { songs } from '../src/data/songs';

const songsById = new Map(songs.map((s) => [s.id, s]));

interface Player {
  id: string;
  name: string;
  timeline: number[];          // confirmed correct cards from previous rounds
  correctCount: number;
  hasPlaced: boolean;          // has submitted at least once this round
  lastPlacedPosition: number | null; // most recent submitted position (validated at reveal)
}

interface RoomState {
  host: string;
  goal: number;
  gameStarted: boolean;
  deck: number[];
  deckIndex: number;
  startingCardId: number;
  players: Map<string, Player>;
  phase: 'lobby' | 'placing' | 'reveal';
}

function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isCorrectPlacement(timeline: number[], newId: number, position: number): boolean {
  const next = [...timeline];
  next.splice(position, 0, newId);
  return next.every((id, i) => {
    if (i === 0) return true;
    return (songsById.get(next[i - 1])?.year ?? 0) <= (songsById.get(id)?.year ?? 0);
  });
}

export default class MusicsterRoom implements Party.Server {
  room: Party.Room;
  state: RoomState;

  constructor(room: Party.Room) {
    this.room = room;
    this.state = {
      host: '',
      goal: 8,
      gameStarted: false,
      deck: [],
      deckIndex: 0,
      startingCardId: 0,
      players: new Map(),
      phase: 'lobby',
    };
  }

  onConnect(conn: Party.Connection) {
    conn.send(JSON.stringify({ type: 'room_state', ...this.getRoomSnapshot() }));
  }

  onClose(conn: Party.Connection) {
    this.state.players.delete(conn.id);
    if (this.state.host === conn.id && this.state.gameStarted) {
      this.broadcast({ type: 'game_over', winner: null, reason: 'host_left', timelines: [] });
      this.state.gameStarted = false;
      this.state.phase = 'lobby';
    }
    this.broadcast({ type: 'room_state', ...this.getRoomSnapshot() });
  }

  onMessage(message: string, sender: Party.Connection) {
    const msg = JSON.parse(message as string);

    switch (msg.type) {
      case 'join': {
        if (this.state.players.size === 0) this.state.host = sender.id;
        this.state.players.set(sender.id, {
          id: sender.id,
          name: msg.playerName,
          timeline: [],
          correctCount: 0,
          hasPlaced: false,
          lastPlacedPosition: null,
        });
        this.state.goal = msg.goal ?? this.state.goal;
        this.broadcast({ type: 'room_state', ...this.getRoomSnapshot() });
        break;
      }

      case 'set_goal': {
        if (sender.id !== this.state.host) return;
        this.state.goal = msg.goal;
        this.broadcast({ type: 'room_state', ...this.getRoomSnapshot() });
        break;
      }

      case 'start_game': {
        if (sender.id !== this.state.host) return;
        this.state.gameStarted = true;
        this.state.phase = 'placing';

        const allIds = songs.map((s) => s.id);
        const shuffled = shuffle(allIds);
        this.state.startingCardId = shuffled[0];
        this.state.deck = shuffled.slice(1);
        this.state.deckIndex = 0;

        for (const p of this.state.players.values()) {
          p.timeline = [this.state.startingCardId];
          p.correctCount = 0;
          p.hasPlaced = false;
          p.lastPlacedPosition = null;
        }

        this.broadcast({
          type: 'game_started',
          goal: this.state.goal,
          startingCardId: this.state.startingCardId,
          firstCardId: this.state.deck[0],
        });
        break;
      }

      case 'place_card': {
        if (this.state.phase !== 'placing') return;
        const player = this.state.players.get(sender.id);
        if (!player) return;

        const firstCommit = !player.hasPlaced;
        player.lastPlacedPosition = msg.position;
        player.hasPlaced = true;

        // Only broadcast waiting list and check for reveal on first commit
        if (firstCommit) {
          const waiting = [...this.state.players.values()]
            .filter((p) => !p.hasPlaced)
            .map((p) => p.name);
          this.broadcast({ type: 'player_placed', player: player.name, waiting });
          if (waiting.length === 0) this.reveal();
        }
        break;
      }

      case 'unplace_card': {
        if (this.state.phase !== 'placing') return;
        const player = this.state.players.get(sender.id);
        if (!player || !player.hasPlaced) return;
        player.hasPlaced = false;
        player.lastPlacedPosition = null;
        const waiting = [...this.state.players.values()]
          .filter((p) => !p.hasPlaced)
          .map((p) => p.name);
        this.broadcast({ type: 'player_placed', player: player.name, waiting });
        break;
      }
    }
  }

  reveal() {
    this.state.phase = 'reveal';
    const cardId = this.state.deck[this.state.deckIndex];

    // Validate each player's last submitted position
    for (const player of this.state.players.values()) {
      const position = player.lastPlacedPosition ?? 0;
      const correct = isCorrectPlacement(player.timeline, cardId, position);
      if (correct) {
        const next = [...player.timeline];
        next.splice(position, 0, cardId);
        player.timeline = next;
        player.correctCount++;
      }
      player.lastPlacedPosition = null;
    }

    const timelines = [...this.state.players.values()].map((p) => ({
      player: p.name,
      timeline: p.timeline,
      correctCount: p.correctCount,
    }));

    this.broadcast({ type: 'reveal', cardId, timelines });

    const winner = [...this.state.players.values()].find((p) => p.correctCount >= this.state.goal);
    if (winner) {
      setTimeout(() => {
        this.broadcast({ type: 'game_over', winner: winner.name, timelines, reason: 'goal_reached' });
        this.state.gameStarted = false;
        this.state.phase = 'lobby';
      }, 3000);
      return;
    }

    this.state.deckIndex++;
    if (this.state.deckIndex >= this.state.deck.length) {
      const sorted = [...this.state.players.values()].sort((a, b) => b.correctCount - a.correctCount);
      setTimeout(() => {
        this.broadcast({ type: 'game_over', winner: sorted[0].name, timelines, reason: 'deck_empty' });
        this.state.gameStarted = false;
        this.state.phase = 'lobby';
      }, 3000);
      return;
    }

    for (const p of this.state.players.values()) {
      p.hasPlaced = false;
      p.lastPlacedPosition = null;
    }

    setTimeout(() => {
      this.state.phase = 'placing';
      this.broadcast({ type: 'card_dealt', cardId: this.state.deck[this.state.deckIndex] });
    }, 3000);
  }

  getRoomSnapshot() {
    return {
      players: [...this.state.players.values()].map((p) => ({
        name: p.name,
        correctCount: p.correctCount,
        isHost: p.id === this.state.host,
      })),
      goal: this.state.goal,
      gameStarted: this.state.gameStarted,
    };
  }

  broadcast(msg: object) {
    this.room.broadcast(JSON.stringify(msg));
  }
}
