import React, { useState, useEffect, useCallback } from 'react';
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
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement
    );
  }, []);

  const toggleFullscreen = useCallback(() => {
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
  }, []);

  const handleKeyDown = useCallback((e) => {
    // Check for Cmd+F (Mac) or Ctrl+F (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault(); // Prevent the browser's find functionality
      toggleFullscreen();
    }
  }, [toggleFullscreen]);

  const logout = useCallback(() => {
    setToken('');
    setRefreshToken('');
    setExpiresIn(0);
    setNowPlaying(null);
    
    // Clear localStorage
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_timestamp');
    localStorage.removeItem('spotify_expires_in');
  }, []);

  const refreshAccessToken = useCallback(async (refreshTokenToUse) => {
    try {
      setLoading(true);
      
      // Add retry logic
      let retries = 0;
      const maxRetries = 3;
      let success = false;
      let responseData = null;
      
      while (retries < maxRetries && !success) {
        try {
          const response = await fetch('/api/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshTokenToUse }),
          });

          responseData = await response.json();

          if (response.ok) {
            success = true;
          } else if (response.status === 429) {
            // Rate limiting - wait and retry
            const retryAfter = response.headers.get('Retry-After') || 1;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          } else {
            // Other error - break the loop
            break;
          }
        } catch (retryErr) {
          console.error(`Retry ${retries + 1} failed:`, retryErr);
        }
        
        retries++;
        if (!success && retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      }
      
      if (success && responseData) {
        setToken(responseData.access_token);
        setExpiresIn(responseData.expires_in);
        
        // Update localStorage
        localStorage.setItem('spotify_access_token', responseData.access_token);
        localStorage.setItem('spotify_token_timestamp', Date.now().toString());
        localStorage.setItem('spotify_expires_in', responseData.expires_in);
      } else {
        logout();
        setError('Session expired. Please log in again.');
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
      logout();
      setError('Failed to refresh session. Please log in again.');
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const fetchNowPlaying = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      // Add retry logic
      let retries = 0;
      const maxRetries = 3;
      let success = false;
      let responseData = null;
      
      while (retries < maxRetries && !success) {
        try {
          // Use Authorization header instead of query parameter for better security
          const response = await fetch('/api/now-playing', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          responseData = await response.json();

          if (response.ok) {
            success = true;
          } else if (response.status === 429) {
            // Rate limiting - wait and retry
            const retryAfter = response.headers.get('Retry-After') || 1;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          } else if (response.status === 401 || response.status === 403) {
            // Authentication error - try to refresh token
            refreshAccessToken(refreshToken);
            break;
          } else {
            // Other error - break the loop
            break;
          }
        } catch (retryErr) {
          console.error(`Retry ${retries + 1} failed:`, retryErr);
        }
        
        retries++;
        if (!success && retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      }
      
      if (success && responseData) {
        setNowPlaying(responseData);
      } else if (responseData && responseData.error) {
        setError(responseData.error);
      } else {
        setError('Failed to fetch currently playing track');
      }
    } catch (err) {
      console.error('Error fetching now playing:', err);
      setError('Failed to connect to Spotify. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, refreshToken, refreshAccessToken]);

  // Track user activity
  const handleUserActivity = useCallback(() => {
    setIsActive(true);
    setLastActivity(Date.now());
  }, []);

  // Add event listeners for user activity
  useEffect(() => {
    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Check if user is inactive after 5 minutes
    const inactivityTimer = setInterval(() => {
      if (Date.now() - lastActivity > 5 * 60 * 1000) {
        setIsActive(false);
      }
    }, 60 * 1000);
    
    return () => {
      // Remove event listeners
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      
      clearInterval(inactivityTimer);
    };
  }, [handleUserActivity, lastActivity]);

  // First useEffect for initialization and event listeners
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
  }, [handleFullscreenChange, handleKeyDown, refreshAccessToken]);

  // Second useEffect for token-dependent operations
  useEffect(() => {
    if (!token) return;

    // Set up interval to refresh token before it expires
    const interval = setInterval(() => {
      refreshAccessToken(refreshToken);
    }, (expiresIn - 60) * 1000); // Refresh 1 minute before expiry

    // Set up interval to fetch currently playing track
    // Use a shorter interval when user is active, longer when inactive
    const pollingInterval = isActive ? 5000 : 30000;
    const nowPlayingInterval = setInterval(() => {
      fetchNowPlaying();
    }, pollingInterval);

    // Initial fetch
    fetchNowPlaying();

    return () => {
      clearInterval(interval);
      clearInterval(nowPlayingInterval);
    };
  }, [token, refreshToken, expiresIn, refreshAccessToken, fetchNowPlaying, isActive]);

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
          aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          aria-pressed={isFullscreen}
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