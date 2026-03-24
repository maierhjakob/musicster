import './SongCard.css';

export default function SongCard({ song, revealed = false }) {
  return (
    <div className={`song-card ${revealed ? 'revealed' : ''}`}>
      <div className="song-card-inner">
        <div className="song-card-front">
          <span className="card-note">&#9835;</span>
          <p className="card-mystery">?</p>
        </div>
        <div className="song-card-back">
          <p className="card-year">{song?.year}</p>
          <p className="card-title">{song?.title}</p>
          <p className="card-artist">{song?.artist}</p>
        </div>
      </div>
    </div>
  );
}
