import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  refreshAccessToken, 
  storeAuthData, 
  getStoredAuthData, 
  clearAuthData, 
  isTokenValid,
  tokenNeedsRefresh
} from '../services/spotifyService';

/**
 * Custom hook to handle Spotify authentication
 * @returns {Object} - Object containing auth state and functions
 */
const useSpotifyAuth = () => {
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [error, setError] = useState('');
  const refreshingRef = useRef(false);

  // Function to handle logout
  const logout = useCallback(() => {
    setToken('');
    setRefreshToken('');
    clearAuthData();
  }, []);

  // Function to refresh the access token
  const refresh = useCallback(async (refreshTokenToUse) => {
    if (!refreshTokenToUse) {
      setError('No refresh token available');
      return false;
    }

    // Prevent multiple simultaneous refresh attempts
    if (refreshingRef.current) {
      return true; // Assume it will succeed to prevent cascading failures
    }

    refreshingRef.current = true;
    setError('');

    try {
      const result = await refreshAccessToken(refreshTokenToUse);
      
      if (result.error) {
        setError(result.error);
        logout();
        return false;
      }
      
      const { access_token, expires_in } = result.data;
      
      setToken(access_token);
      
      // Update localStorage
      storeAuthData({
        accessToken: access_token,
        refreshToken: refreshTokenToUse,
        expiresIn: expires_in
      });
      
      return true;
    } catch (err) {
      setError('Failed to refresh session. Please log in again.');
      logout();
      return false;
    } finally {
      refreshingRef.current = false;
    }
  }, [logout]);

  // Initialize authentication state
  useEffect(() => {
    // Parse tokens from URL if present
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get('access_token');
    const refreshTokenParam = queryParams.get('refresh_token');
    const expiresInParam = queryParams.get('expires_in');
    const errorParam = queryParams.get('error');

    if (errorParam) {
      setError('Authentication failed. Please try again.');
      return;
    }

    if (accessToken) {
      // Clear URL parameters
      window.history.replaceState({}, document.title, '/');
      
      // Set tokens in state
      setToken(accessToken);
      setRefreshToken(refreshTokenParam);
      
      // Store tokens in localStorage
      storeAuthData({
        accessToken,
        refreshToken: refreshTokenParam,
        expiresIn: expiresInParam
      });
    } else {
      // Check if tokens exist in localStorage
      const authData = getStoredAuthData();
      
      if (authData) {
        const { accessToken, refreshToken: storedRefreshToken } = authData;
        
        if (isTokenValid()) {
          // Token is still valid
          setToken(accessToken);
          setRefreshToken(storedRefreshToken);
          
          // Check if token needs refreshing soon
          if (tokenNeedsRefresh()) {
            refresh(storedRefreshToken);
          }
        } else {
          // Token expired, refresh it
          refresh(storedRefreshToken);
        }
      }
    }
  }, [refresh]);

  // Set up interval to refresh token before it expires
  useEffect(() => {
    if (!token || !refreshToken) return;

    // Refresh token every 30 minutes to be safe
    // This is more aggressive than waiting until just before expiry
    const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
    
    const interval = setInterval(() => {
      refresh(refreshToken);
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [token, refreshToken, refresh]);

  return {
    token,
    refreshToken,
    error,
    logout,
    refresh,
    isAuthenticated: !!token
  };
};

export default useSpotifyAuth; 