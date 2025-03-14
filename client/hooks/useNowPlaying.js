import { useState, useEffect, useCallback, useRef } from 'react';
import { getNowPlaying, tokenNeedsRefresh } from '../services/spotifyService';

/**
 * Custom hook to fetch and manage the currently playing track
 * @param {string} token - The access token
 * @param {function} refreshToken - Function to refresh the token
 * @returns {Object} - Object containing nowPlaying state and functions
 */
const useNowPlaying = (token, refreshToken) => {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timeoutRef = useRef(null);
  const lastFetchRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const refreshAttemptedRef = useRef(false);
  
  // Polling interval in milliseconds (5 seconds)
  const POLLING_INTERVAL = 5000;

  // Function to fetch the currently playing track
  const fetchNowPlaying = useCallback(async () => {
    if (!token) return;
    
    // Throttle API calls to prevent excessive requests
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;
    
    if (timeSinceLastFetch < POLLING_INTERVAL) {
      const waitTime = POLLING_INTERVAL - timeSinceLastFetch;
      timeoutRef.current = setTimeout(fetchNowPlaying, waitTime);
      return;
    }
    
    // Check if token needs refreshing before making the API call
    if (tokenNeedsRefresh()) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        setError('Session expired. Please log in again.');
        return;
      }
      refreshAttemptedRef.current = false; // Reset the flag after successful refresh
    }
    
    // Update last fetch timestamp
    lastFetchRef.current = now;
    
    setLoading(true);
    setError('');

    try {
      const result = await getNowPlaying(token);
      
      if (result.error) {
        // Check if it's an authentication error
        if ((result.status === 401 || result.status === 403) && !refreshAttemptedRef.current) {
          refreshAttemptedRef.current = true; // Set flag to prevent refresh loops
          const refreshed = await refreshToken();
          if (!refreshed) {
            setError('Session expired. Please log in again.');
          } else {
            // Try the API call again with the new token after a short delay
            setTimeout(fetchNowPlaying, 1000);
          }
        } else {
          setError(result.error);
        }
      } else if (result.data) {
        // Reset refresh attempt flag on successful API call
        refreshAttemptedRef.current = false;
        setNowPlaying(result.data);
      }
    } catch (err) {
      setError('Failed to connect to Spotify. Please try again.');
    } finally {
      setLoading(false);
      
      // Schedule next fetch at fixed interval
      timeoutRef.current = setTimeout(fetchNowPlaying, POLLING_INTERVAL);
    }
  }, [token, refreshToken]);

  // Initial fetch and cleanup
  useEffect(() => {
    if (!token || hasInitializedRef.current) return;
    
    // Mark as initialized to prevent duplicate initial fetches
    hasInitializedRef.current = true;

    // Initial fetch
    fetchNowPlaying();
    
    return () => {
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [token, fetchNowPlaying]);

  return {
    nowPlaying,
    loading,
    error,
    fetchNowPlaying
  };
};

export default useNowPlaying; 