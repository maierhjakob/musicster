# Musicster

Play at: https://maierhjakob.github.io/musicster/

Musicster is a music trivia game where you build a timeline of songs in the correct chronological order. Each round you are given a song and must drag it into the right position among the songs you have already placed. Once you confirm your placement, the year is revealed and you find out whether you were right.

## How to play

You start with one song already placed in your timeline. Each new round a song plays automatically as a 30-second preview. Drag the card into the position where you think it belongs, earlier songs on the left and later songs on the right. After placing it, the year is revealed. A correct placement keeps the song in your timeline. A wrong placement removes it.

You can filter songs by genre before starting: Rock, Pop, Hip-Hop, Soul, or Metal. Selecting All draws from the full song library.

## Multiplayer

Create a game room and share the four-letter code with friends. Everyone plays the same song at the same time on their own device. Once all players have placed their card, the year is revealed to everyone simultaneously. You can reposition your card freely until the last player has placed theirs. The first player to reach the win goal (set by the host before the game) wins.

After a game ends anyone can tap Play Again to return to the lobby and start a new round without leaving the room.

## Adding songs

Songs are managed server-side in `party/songs.ts`. To add a song, append an entry to the array and run `npx partykit deploy`. No app update is required. If you introduce a new genre, also add it to `src/data/songs.ts` and redeploy the web app.
