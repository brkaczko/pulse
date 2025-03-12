import React, { useState, useEffect } from 'react';
import Login from './Login';
import NowPlaying from './NowPlaying';
import NotPlaying from './NotPlaying';
import Loading from './Loading';

const App = () => {
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  useEffect(() => {
    // Parse tokens from URL if present
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get('access_token');
    const refreshToken = queryParams.get('refresh_token');
    const expiresIn = queryParams.get('expires_in');
    const error = queryParams.get('error');

    if (error) {
      setError('Authentication failed. Please try again.');
      return;
    }

    if (accessToken) {
      // Clear URL parameters
      window.history.replaceState({}, document.title, '/');
      
      // Set tokens in state
      setToken(accessToken);
      setRefreshToken(refreshToken);
      setExpiresIn(parseInt(expiresIn));
      
      // Store tokens in localStorage
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
      localStorage.setItem('spotify_token_timestamp', Date.now().toString());
      localStorage.setItem('spotify_expires_in', expiresIn);
    } else {
      // Check if tokens exist in localStorage
      const storedAccessToken = localStorage.getItem('spotify_access_token');
      const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
      const storedTimestamp = localStorage.getItem('spotify_token_timestamp');
      const storedExpiresIn = localStorage.getItem('spotify_expires_in');
      
      if (storedAccessToken && storedRefreshToken) {
        const currentTime = Date.now();
        const tokenAge = currentTime - parseInt(storedTimestamp);
        const tokenExpiry = parseInt(storedExpiresIn) * 1000;
        
        if (tokenAge < tokenExpiry) {
          // Token is still valid
          setToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setExpiresIn(parseInt(storedExpiresIn));
        } else {
          // Token expired, refresh it
          refreshAccessToken(storedRefreshToken);
        }
      }
    }

    // Check fullscreen state on change
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Add keyboard shortcut for fullscreen
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const handleKeyDown = (e) => {
    // Check for Cmd+F (Mac) or Ctrl+F (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault(); // Prevent the browser's find functionality
      toggleFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement
    );
  };

  const toggleFullscreen = () => {
    // Force check the current fullscreen state
    const isCurrentlyFullscreen = 
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement;
    
    if (!isCurrentlyFullscreen) {
      const docEl = document.documentElement;
      
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (!token) return;

    // Set up interval to refresh token before it expires
    const interval = setInterval(() => {
      refreshAccessToken(refreshToken);
    }, (expiresIn - 60) * 1000); // Refresh 1 minute before expiry

    // Set up interval to fetch currently playing track
    const nowPlayingInterval = setInterval(() => {
      fetchNowPlaying();
    }, 5000);

    // Initial fetch
    fetchNowPlaying();

    return () => {
      clearInterval(interval);
      clearInterval(nowPlayingInterval);
    };
  }, [token, refreshToken, expiresIn]);

  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        setExpiresIn(data.expires_in);
        
        // Update localStorage
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_token_timestamp', Date.now().toString());
        localStorage.setItem('spotify_expires_in', data.expires_in);
      } else {
        logout();
        setError('Session expired. Please log in again.');
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
      logout();
      setError('Failed to refresh session. Please log in again.');
    }
  };

  const fetchNowPlaying = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/now-playing?access_token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setNowPlaying(data);
      } else {
        setError(data.error || 'Failed to fetch currently playing track');
      }
    } catch (err) {
      console.error('Error fetching now playing:', err);
      setError('Failed to connect to Spotify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setRefreshToken('');
    setExpiresIn(0);
    setNowPlaying(null);
    
    // Clear localStorage
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_timestamp');
    localStorage.removeItem('spotify_expires_in');
  };

  if (!token) {
    return <Login error={error} />;
  }

  // Simplified return with fullscreen button
  return (
    <>
      <div className="fullscreen-button-container">
        <button 
          className="fullscreen-button" 
          onClick={toggleFullscreen}
          title={isFullscreen ? `Exit Fullscreen (${modKey}+F)` : `Enter Fullscreen (${modKey}+F)`}
        >
          {isFullscreen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
            </svg>
          )}
        </button>
        <span className="shortcut-hint">{modKey}+F</span>
      </div>
      
      {loading && !nowPlaying ? (
        <Loading />
      ) : error ? (
        <div className="error">{error}</div>
      ) : nowPlaying?.isPlaying ? (
        <NowPlaying track={nowPlaying.track} />
      ) : (
        <NotPlaying />
      )}
    </>
  );
};

export default App; 