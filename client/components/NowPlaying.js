import React, { useState, useEffect, useRef } from 'react';

const NowPlaying = ({ track }) => {
  const [progress, setProgress] = useState(track.progress);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const intervalRef = useRef(null);

  useEffect(() => {
    // Update progress when track changes
    setProgress(track.progress);
    
    // Format duration
    const durationMinutes = Math.floor(track.duration / 60000);
    const durationSeconds = Math.floor((track.duration % 60000) / 1000);
    setDuration(`${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`);
    
    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set up interval to update progress
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        // If we've reached the end of the track, stop updating
        if (prev >= track.duration) {
          clearInterval(intervalRef.current);
          return track.duration;
        }
        return prev + 1000;
      });
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [track]);
  
  useEffect(() => {
    // Calculate progress percentage
    const percent = (progress / track.duration) * 100;
    setProgressPercent(Math.min(percent, 100)); // Ensure it doesn't exceed 100%
    
    // Format current time
    const minutes = Math.floor(progress / 60000);
    const seconds = Math.floor((progress % 60000) / 1000);
    setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }, [progress, track.duration]);

  return (
    <div className="now-playing-widget">
      <div className="widget-content">
        <img 
          src={track.albumArt || 'https://via.placeholder.com/300'} 
          alt={`${track.album} cover`} 
          className="widget-album-art" 
        />
        
        <div className="widget-track-info">
          <div className="widget-track-details">
            <h2 className="widget-track-name">{track.name}</h2>
            <p className="widget-artist-name">{track.artist}</p>
          </div>
        </div>
      </div>
      
      <div className="widget-progress-container">
        <div className="widget-progress-bar">
          <div 
            className="widget-progress" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="widget-time-info">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying; 