import { rock } from './songs/rock';
import { pop } from './songs/pop';
import { hiphop } from './songs/hiphop';
import { soul } from './songs/soul';
import { metal } from './songs/metal';

export type Genre = 'Rock' | 'Pop' | 'Hip-Hop' | 'Soul' | 'Metal';

export interface SongData {
  title: string;
  artist: string;
  year: number;
}

export interface Song extends SongData {
  id: number;
  genre: Genre;
  previewUrl: string | null;
}

function tag(data: SongData[], genre: Genre, startId: number): Song[] {
  return data.map((s, i) => ({ ...s, id: startId + i, genre, previewUrl: null }));
}

export const songs: Song[] = [
  ...tag(rock,   'Rock',   1),
  ...tag(pop,    'Pop',    1001),
  ...tag(hiphop, 'Hip-Hop', 2001),
  ...tag(soul,   'Soul',   3001),
  ...tag(metal,  'Metal',  4001),
];
