import { useMultiplayer } from '../context/MultiplayerContext';
import './MultiplayerResultScreen.css';

export default function MultiplayerResultScreen() {
  const { state, playAgain, leaveRoom } = useMultiplayer();
  const { winner, allTimelines, goal } = state;

  return (
    <div className="mp-result-screen">
      <div className="mp-result-header">
        <h1 className="mp-result-winner">
          {winner ? `🏆 ${winner} wins!` : 'Game over!'}
        </h1>
        <p className="mp-result-sub">First to {goal} correct placements</p>
      </div>

      <div className="mp-result-timelines">
        {allTimelines
          .slice()
          .sort((a, b) => b.correctCount - a.correctCount)
          .map((entry) => (
            <div key={entry.player} className={`mp-player-timeline ${entry.player === winner ? 'winner' : ''}`}>
              <div className="mp-player-header">
                <span className="mp-player-name">
                  {entry.player === winner && '🏆 '}
                  {entry.player}
                </span>
                <span className="mp-player-score">{entry.correctCount}/{goal}</span>
              </div>

              <div className="mp-mini-timeline">
                {entry.timeline.map((song, i) => {
                  // First card is the starting card (always correct)
                  const isStarting = i === 0;
                  // For subsequent cards, check if the previous year <= this year
                  const correct =
                    isStarting || entry.timeline[i - 1].year <= song.year;
                  return (
                    <div
                      key={song.id}
                      className={`mp-mini-card ${isStarting ? 'starting' : correct ? 'correct' : 'wrong'}`}
                    >
                      <span className="mp-mini-artist">{song.artist}</span>
                      <span className="mp-mini-year">{song.year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      <div className="mp-result-footer">
        <button className="btn btn-secondary" onClick={playAgain}>
          Play again
        </button>
        <button className="btn btn-primary" onClick={leaveRoom}>
          Back to home
        </button>
      </div>
    </div>
  );
}
