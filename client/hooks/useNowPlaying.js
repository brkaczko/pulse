import { useState, useEffect, useCallback } from 'react';
import { getNowPlaying } from '../services/spotifyService';

/**
 * Custom hook to fetch and manage the currently playing track
 * @param {string} token - The access token
 * @param {function} refreshToken - Function to refresh the token
 * @param {boolean} isActive - Whether the user is active
 * @returns {Object} - Object containing nowPlaying state and functions
 */
const useNowPlaying = (token, refreshToken, isActive) => {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to fetch the currently playing track
  const fetchNowPlaying = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const result = await getNowPlaying(token);
      
      if (result.error) {
        // Check if it's an authentication error
        if (result.status === 401 || result.status === 403) {
          // Try to refresh the token
          const refreshed = await refreshToken();
          if (!refreshed) {
            setError('Session expired. Please log in again.');
          }
        } else {
          setError(result.error);
        }
      } else if (result.data) {
        setNowPlaying(result.data);
      }
    } catch (err) {
      console.error('Error in useNowPlaying hook:', err);
      setError('Failed to connect to Spotify. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, refreshToken]);

  // Set up polling interval based on user activity
  useEffect(() => {
    if (!token) return;

    // Use a shorter interval when user is active, longer when inactive
    const pollingInterval = isActive ? 5000 : 30000;
    
    // Initial fetch
    fetchNowPlaying();
    
    // Set up interval
    const interval = setInterval(() => {
      fetchNowPlaying();
    }, pollingInterval);

    return () => {
      clearInterval(interval);
    };
  }, [token, fetchNowPlaying, isActive]);

  return {
    nowPlaying,
    loading,
    error,
    fetchNowPlaying
  };
};

export default useNowPlaying; 