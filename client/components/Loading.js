import React from 'react';

const Loading = () => {
  return (
    <div className="now-playing-widget loading-widget">
      <div className="widget-content">
        <div className="widget-placeholder-art">
          <div className="widget-spinner"></div>
        </div>
        <div className="widget-track-info">
          <div className="widget-track-details">
            <h2 className="widget-track-name">Loading...</h2>
            <p className="widget-artist-name">Fetching from Spotify</p>
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

export default Loading; 