import React from 'react';
import Login from './Login';
import NowPlaying from './NowPlaying';
import NotPlaying from './NotPlaying';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import FullscreenButton from './FullscreenButton';

// Custom hooks
import useSpotifyAuth from '../hooks/useSpotifyAuth';
import useNowPlaying from '../hooks/useNowPlaying';
import useUserActivity from '../hooks/useUserActivity';
import useFullscreen from '../hooks/useFullscreen';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

/**
 * Main App component
 * @returns {JSX.Element} - Rendered component
 */
const App = () => {
  // Platform detection for keyboard shortcuts
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';
  
  // Custom hooks
  const { 
    token, 
    refreshToken, 
    error: authError, 
    logout, 
    refresh,
    isAuthenticated 
  } = useSpotifyAuth();
  
  const { isActive } = useUserActivity();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  const { 
    nowPlaying, 
    loading, 
    error: apiError,
    fetchNowPlaying 
  } = useNowPlaying(token, () => refresh(refreshToken), isActive);

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    [`${isMac ? 'Cmd' : 'Ctrl'}+f`]: toggleFullscreen
  });

  // Combine errors from auth and API
  const error = authError || apiError;

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <Login error={error} />;
  }

  // Main app UI
  return (
    <>
      <FullscreenButton 
        isFullscreen={isFullscreen} 
        toggleFullscreen={toggleFullscreen} 
        modKey={modKey} 
      />
      
      {loading && !nowPlaying ? (
        <Loading />
      ) : error ? (
        <ErrorMessage 
          message={error} 
          onRetry={error.includes('Authentication') ? null : fetchNowPlaying} 
        />
      ) : nowPlaying?.isPlaying ? (
        <NowPlaying track={nowPlaying.track} />
      ) : (
        <NotPlaying />
      )}
    </>
  );
};

export default App; 