export type Genre = 'Rock' | 'Pop' | 'Hip-Hop' | 'Soul';

export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  genre: Genre;
  previewUrl: string | null;
}

export const songs: Song[] = [
  { id: 1,  title: "Bohemian Rhapsody",       artist: "Queen",                         year: 1975, genre: 'Rock',    previewUrl: null },
  { id: 2,  title: "Smells Like Teen Spirit",  artist: "Nirvana",                       year: 1991, genre: 'Rock',    previewUrl: null },
  { id: 3,  title: "Like a Rolling Stone",     artist: "Bob Dylan",                     year: 1965, genre: 'Rock',    previewUrl: null },
  { id: 4,  title: "Purple Rain",              artist: "Prince",                        year: 1984, genre: 'Soul',    previewUrl: null },
  { id: 5,  title: "Billie Jean",              artist: "Michael Jackson",               year: 1983, genre: 'Pop',     previewUrl: null },
  { id: 6,  title: "Hotel California",         artist: "Eagles",                        year: 1977, genre: 'Rock',    previewUrl: null },
  { id: 7,  title: "Superstition",             artist: "Stevie Wonder",                 year: 1972, genre: 'Soul',    previewUrl: null },
  { id: 8,  title: "Lose Yourself",            artist: "Eminem",                        year: 2002, genre: 'Hip-Hop', previewUrl: null },
  { id: 9,  title: "Rolling in the Deep",      artist: "Adele",                         year: 2010, genre: 'Pop',     previewUrl: null },
  { id: 10, title: "Shape of You",             artist: "Ed Sheeran",                    year: 2017, genre: 'Pop',     previewUrl: null },
  { id: 11, title: "Blinding Lights",          artist: "The Weeknd",                    year: 2019, genre: 'Pop',     previewUrl: null },
  { id: 12, title: "God's Plan",               artist: "Drake",                         year: 2018, genre: 'Hip-Hop', previewUrl: null },
  { id: 13, title: "Old Town Road",            artist: "Lil Nas X",                     year: 2019, genre: 'Hip-Hop', previewUrl: null },
  { id: 14, title: "Someone Like You",         artist: "Adele",                         year: 2011, genre: 'Pop',     previewUrl: null },
  { id: 15, title: "Uptown Funk",              artist: "Mark Ronson ft. Bruno Mars",    year: 2014, genre: 'Pop',     previewUrl: null },
  { id: 16, title: "Happy",                    artist: "Pharrell Williams",             year: 2013, genre: 'Pop',     previewUrl: null },
  { id: 17, title: "Despacito",                artist: "Luis Fonsi ft. Daddy Yankee",   year: 2017, genre: 'Pop',     previewUrl: null },
  { id: 18, title: "Can't Stop the Feeling",   artist: "Justin Timberlake",             year: 2016, genre: 'Pop',     previewUrl: null },
  { id: 19, title: "Thriller",                 artist: "Michael Jackson",               year: 1982, genre: 'Pop',     previewUrl: null },
  { id: 20, title: "Born to Run",              artist: "Bruce Springsteen",             year: 1975, genre: 'Rock',    previewUrl: null },
  { id: 21, title: "Respect",                  artist: "Aretha Franklin",               year: 1967, genre: 'Soul',    previewUrl: null },
  { id: 22, title: "Johnny B. Goode",          artist: "Chuck Berry",                   year: 1958, genre: 'Rock',    previewUrl: null },
  { id: 23, title: "What's Going On",          artist: "Marvin Gaye",                   year: 1971, genre: 'Soul',    previewUrl: null },
  { id: 24, title: "Imagine",                  artist: "John Lennon",                   year: 1971, genre: 'Rock',    previewUrl: null },
  { id: 25, title: "Yesterday",                artist: "The Beatles",                   year: 1965, genre: 'Rock',    previewUrl: null },
  { id: 26, title: "Hey Jude",                 artist: "The Beatles",                   year: 1968, genre: 'Rock',    previewUrl: null },
  { id: 27, title: "Stairway to Heaven",       artist: "Led Zeppelin",                  year: 1971, genre: 'Rock',    previewUrl: null },
  { id: 28, title: "Angie",                    artist: "The Rolling Stones",            year: 1973, genre: 'Rock',    previewUrl: null },
  { id: 29, title: "Jump",                     artist: "Van Halen",                     year: 1984, genre: 'Rock',    previewUrl: null },
  { id: 30, title: "Sweet Child O' Mine",      artist: "Guns N' Roses",                 year: 1987, genre: 'Rock',    previewUrl: null },
];
