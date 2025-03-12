import React from 'react';

const NotPlaying = () => {
  return (
    <div className="now-playing-widget not-playing-widget">
      <div className="widget-content">
        <div className="widget-placeholder-art">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="#1DB954"/>
          </svg>
        </div>
        <div className="widget-track-info">
          <div className="widget-track-details">
            <h2 className="widget-track-name">Nothing Playing</h2>
            <p className="widget-artist-name">Start playing something on Spotify</p>
          </div>
        </div>
      </div>
      
      <div className="widget-progress-container">
        <div className="widget-progress-bar">
          <div className="widget-progress" style={{ width: '0%' }}></div>
        </div>
        <div className="widget-time-info">
          <span>0:00</span>
          <span>0:00</span>
        </div>
      </div>
    </div>
  );
};

export default NotPlaying; 