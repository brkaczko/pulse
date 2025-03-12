import { useState, useEffect, useCallback } from 'react';
import { 
  refreshAccessToken, 
  storeAuthData, 
  getStoredAuthData, 
  clearAuthData, 
  isTokenValid 
} from '../services/spotifyService';

/**
 * Custom hook to handle Spotify authentication
 * @returns {Object} - Object containing auth state and functions
 */
const useSpotifyAuth = () => {
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle logout
  const logout = useCallback(() => {
    setToken('');
    setRefreshToken('');
    setExpiresIn(0);
    clearAuthData();
  }, []);

  // Function to refresh the access token
  const refresh = useCallback(async (refreshTokenToUse) => {
    if (!refreshTokenToUse) {
      setError('No refresh token available');
      return false;
    }

    setLoading(true);
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
      setExpiresIn(expires_in);
      
      // Update localStorage
      storeAuthData({
        accessToken: access_token,
        refreshToken: refreshTokenToUse,
        expiresIn: expires_in
      });
      
      return true;
    } catch (err) {
      console.error('Error in refresh token hook:', err);
      setError('Failed to refresh session. Please log in again.');
      logout();
      return false;
    } finally {
      setLoading(false);
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
      setExpiresIn(parseInt(expiresInParam));
      
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
        const { accessToken, refreshToken: storedRefreshToken, expiresIn: storedExpiresIn } = authData;
        
        if (isTokenValid()) {
          // Token is still valid
          setToken(accessToken);
          setRefreshToken(storedRefreshToken);
          setExpiresIn(storedExpiresIn);
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

    const interval = setInterval(() => {
      refresh(refreshToken);
    }, (expiresIn - 60) * 1000); // Refresh 1 minute before expiry

    return () => {
      clearInterval(interval);
    };
  }, [token, refreshToken, expiresIn, refresh]);

  return {
    token,
    refreshToken,
    expiresIn,
    error,
    loading,
    logout,
    refresh,
    isAuthenticated: !!token
  };
};

export default useSpotifyAuth; 