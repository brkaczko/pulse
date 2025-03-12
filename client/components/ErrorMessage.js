import React from 'react';

/**
 * Error message component with retry functionality
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {function} props.onRetry - Function to call when retry button is clicked
 * @returns {JSX.Element} - Rendered component
 */
const ErrorMessage = ({ message, onRetry }) => {
  // Map error messages to more user-friendly messages and actions
  const getErrorDetails = (errorMessage) => {
    if (errorMessage.includes('Authentication failed') || 
        errorMessage.includes('Session expired') ||
        errorMessage.includes('log in again')) {
      return {
        title: 'Authentication Error',
        description: 'Your session has expired or is invalid.',
        action: 'Please log in again to continue.'
      };
    } else if (errorMessage.includes('Failed to connect')) {
      return {
        title: 'Connection Error',
        description: 'Could not connect to Spotify.',
        action: 'Please check your internet connection and try again.'
      };
    } else if (errorMessage.includes('currently playing')) {
      return {
        title: 'Playback Error',
        description: 'Could not fetch your currently playing track.',
        action: 'Please try again in a moment.'
      };
    } else {
      return {
        title: 'Error',
        description: errorMessage || 'An unknown error occurred.',
        action: 'Please try again.'
      };
    }
  };

  const { title, description, action } = getErrorDetails(message);

  return (
    <div className="error-container" role="alert">
      <div className="error-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor"/>
        </svg>
      </div>
      <div className="error-content">
        <h3 className="error-title">{title}</h3>
        <p className="error-description">{description}</p>
        <p className="error-action">{action}</p>
      </div>
      {onRetry && (
        <button 
          className="error-retry-button"
          onClick={onRetry}
          aria-label="Retry"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 