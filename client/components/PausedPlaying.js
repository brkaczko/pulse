import React from 'react';

const PausedPlaying = ({ track }) => {
  return (
    <div className="now-playing-widget paused-playing-widget">
      <div className="widget-content">
        {track?.albumArt ? (
          <img 
            src={track.albumArt} 
            alt={`${track.album} cover`} 
            className="widget-album-art" 
            style={{ opacity: 0.6 }}
          />
        ) : (
          <div className="widget-placeholder-art">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="#b3b3b3"/>
            </svg>
          </div>
        )}
        
        <div className="widget-track-info">
          <div className="widget-track-details">
            <h2 className="widget-track-name" style={{ color: '#b3b3b3' }}>
              {track ? track.name : 'Nothing Playing'}
            </h2>
            <p className="widget-artist-name" style={{ color: '#808080' }}>
              {track ? track.artist : 'Start playing something on Spotify'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="widget-progress-container">
        <div className="widget-progress-bar">
          <div 
            className="widget-progress" 
            style={{ 
              width: track ? `${(track.progress / track.duration) * 100}%` : '0%',
              backgroundColor: '#808080' 
            }}
          ></div>
        </div>
        <div className="widget-time-info">
          <span style={{ color: '#808080' }}>
            {track ? `${Math.floor(track.progress / 60000)}:${Math.floor((track.progress % 60000) / 1000).toString().padStart(2, '0')}` : '0:00'}
          </span>
          <span style={{ color: '#808080' }}>
            {track ? `${Math.floor(track.duration / 60000)}:${Math.floor((track.duration % 60000) / 1000).toString().padStart(2, '0')}` : '0:00'}
          </span>
        </div>
      </div>
      
      <div className="paused-indicator">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="4" width="4" height="16" rx="1" fill="#b3b3b3"/>
          <rect x="14" y="4" width="4" height="16" rx="1" fill="#b3b3b3"/>
        </svg>
      </div>
    </div>
  );
};

export default PausedPlaying; 