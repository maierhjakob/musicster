export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  previewUrl: string | null;
}

export const songs: Song[] = [
  { id: 1,  title: "Bohemian Rhapsody",       artist: "Queen",                         year: 1975, previewUrl: null },
  { id: 2,  title: "Smells Like Teen Spirit",  artist: "Nirvana",                       year: 1991, previewUrl: null },
  { id: 3,  title: "Like a Rolling Stone",     artist: "Bob Dylan",                     year: 1965, previewUrl: null },
  { id: 4,  title: "Purple Rain",              artist: "Prince",                        year: 1984, previewUrl: null },
  { id: 5,  title: "Billie Jean",              artist: "Michael Jackson",               year: 1983, previewUrl: null },
  { id: 6,  title: "Hotel California",         artist: "Eagles",                        year: 1977, previewUrl: null },
  { id: 7,  title: "Superstition",             artist: "Stevie Wonder",                 year: 1972, previewUrl: null },
  { id: 8,  title: "Lose Yourself",            artist: "Eminem",                        year: 2002, previewUrl: null },
  { id: 9,  title: "Rolling in the Deep",      artist: "Adele",                         year: 2010, previewUrl: null },
  { id: 10, title: "Shape of You",             artist: "Ed Sheeran",                    year: 2017, previewUrl: null },
  { id: 11, title: "Blinding Lights",          artist: "The Weeknd",                    year: 2019, previewUrl: null },
  { id: 12, title: "God's Plan",               artist: "Drake",                         year: 2018, previewUrl: null },
  { id: 13, title: "Old Town Road",            artist: "Lil Nas X",                     year: 2019, previewUrl: null },
  { id: 14, title: "Someone Like You",         artist: "Adele",                         year: 2011, previewUrl: null },
  { id: 15, title: "Uptown Funk",              artist: "Mark Ronson ft. Bruno Mars",    year: 2014, previewUrl: null },
  { id: 16, title: "Happy",                    artist: "Pharrell Williams",             year: 2013, previewUrl: null },
  { id: 17, title: "Despacito",                artist: "Luis Fonsi ft. Daddy Yankee",   year: 2017, previewUrl: null },
  { id: 18, title: "Can't Stop the Feeling",   artist: "Justin Timberlake",             year: 2016, previewUrl: null },
  { id: 19, title: "Thriller",                 artist: "Michael Jackson",               year: 1982, previewUrl: null },
  { id: 20, title: "Born to Run",              artist: "Bruce Springsteen",             year: 1975, previewUrl: null },
  { id: 21, title: "Respect",                  artist: "Aretha Franklin",               year: 1967, previewUrl: null },
  { id: 22, title: "Johnny B. Goode",          artist: "Chuck Berry",                   year: 1958, previewUrl: null },
  { id: 23, title: "What's Going On",          artist: "Marvin Gaye",                   year: 1971, previewUrl: null },
  { id: 24, title: "Imagine",                  artist: "John Lennon",                   year: 1971, previewUrl: null },
  { id: 25, title: "Yesterday",                artist: "The Beatles",                   year: 1965, previewUrl: null },
  { id: 26, title: "Hey Jude",                 artist: "The Beatles",                   year: 1968, previewUrl: null },
  { id: 27, title: "Stairway to Heaven",       artist: "Led Zeppelin",                  year: 1971, previewUrl: null },
  { id: 28, title: "Angie",                    artist: "The Rolling Stones",            year: 1973, previewUrl: null },
  { id: 29, title: "Jump",                     artist: "Van Halen",                     year: 1984, previewUrl: null },
  { id: 30, title: "Sweet Child O' Mine",      artist: "Guns N' Roses",                 year: 1987, previewUrl: null },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
