import React from 'react';

/**
 * Fullscreen button component
 * @param {Object} props - Component props
 * @param {boolean} props.isFullscreen - Whether the app is in fullscreen mode
 * @param {function} props.toggleFullscreen - Function to toggle fullscreen
 * @param {string} props.modKey - Modifier key for the shortcut (Cmd or Ctrl)
 * @returns {JSX.Element} - Rendered component
 */
const FullscreenButton = ({ isFullscreen, toggleFullscreen, modKey }) => {
  return (
    <div 
      className="fullscreen-button-container"
      onClick={toggleFullscreen}
      title={isFullscreen ? `Exit Fullscreen (${modKey}+F)` : `Enter Fullscreen (${modKey}+F)`}
      role="button"
      tabIndex="0"
      aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      aria-pressed={isFullscreen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFullscreen();
        }
      }}
    >
      <button 
        className="fullscreen-button" 
        aria-hidden="true"
        tabIndex="-1"
      >
        {isFullscreen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
          </svg>
        )}
      </button>
      <span className="shortcut-hint" aria-hidden="true">{modKey}+F</span>
    </div>
  );
};

export default FullscreenButton; 