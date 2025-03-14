import React, { useState, useEffect } from 'react';
import Login from './Login';
import NowPlaying from './NowPlaying';
import NotPlaying from './NotPlaying';
import PausedPlaying from './PausedPlaying';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import FullscreenButton from './FullscreenButton';

// Custom hooks
import useSpotifyAuth from '../hooks/useSpotifyAuth';
import useNowPlaying from '../hooks/useNowPlaying';
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
  
  // State to keep track of the last played track
  const [lastPlayedTrack, setLastPlayedTrack] = useState(null);
  
  // Custom hooks
  const { 
    token, 
    refreshToken, 
    error: authError, 
    refresh,
    isAuthenticated 
  } = useSpotifyAuth();
  
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  const { 
    nowPlaying, 
    loading, 
    error: apiError,
    fetchNowPlaying 
  } = useNowPlaying(token, () => refresh(refreshToken));

  // Update lastPlayedTrack when a track is playing or paused
  useEffect(() => {
    if (nowPlaying?.track) {
      // Always update lastPlayedTrack when we have track data
      // This ensures we have the most recent track info
      setLastPlayedTrack(nowPlaying.track);
    }
  }, [nowPlaying]);

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
      ) : lastPlayedTrack ? (
        <PausedPlaying track={lastPlayedTrack} />
      ) : (
        <NotPlaying />
      )}
    </>
  );
};

export default App; 