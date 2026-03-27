export type Genre = 'Rock' | 'Pop' | 'Hip-Hop' | 'Soul';
export const GENRES: Genre[] = ['Rock', 'Pop', 'Hip-Hop', 'Soul'];

export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  genre: Genre;
  previewUrl: string | null;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
