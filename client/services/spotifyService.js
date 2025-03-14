/**
 * Spotify API Service
 * Handles all interactions with the Spotify API
 */

// Utility function for retrying API calls
const retryFetch = async (url, options, maxRetries = 3) => {
  let retries = 0;
  let success = false;
  let responseData = null;
  
  while (retries < maxRetries && !success) {
    try {
      const response = await fetch(url, options);
      responseData = await response.json();

      if (response.ok) {
        success = true;
      } else if (response.status === 429) {
        // Rate limiting - wait and retry
        const retryAfter = response.headers.get('Retry-After') || 1;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 10000));
      } else if (response.status === 401 || response.status === 403) {
        // Authentication error - should be handled by the caller
        return { error: 'Authentication error', status: response.status, data: responseData };
      } else {
        // Other error - break the loop
        return { error: responseData.error || 'Unknown error', status: response.status, data: responseData };
      }
    } catch (err) {
      // Silent error handling for retries
    }
    
    retries++;
    if (!success && retries < maxRetries) {
      // Wait before retrying (exponential backoff)
      const backoffTime = 10000 * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  if (success) {
    return { data: responseData };
  }
  
  return { error: 'Failed after multiple retries', data: responseData };
};

/**
 * Get the currently playing track
 * @param {string} token - The access token
 * @returns {Promise<Object>} - The response data or error
 */
export const getNowPlaying = async (token) => {
  if (!token) {
    return { error: 'No access token provided' };
  }

  try {
    const result = await retryFetch('/api/now-playing', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return result;
  } catch (err) {
    return { error: 'Failed to connect to Spotify API' };
  }
};

/**
 * Refresh the access token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<Object>} - The response data or error
 */
export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    return { error: 'No refresh token provided' };
  }

  try {
    const result = await retryFetch('/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    return result;
  } catch (err) {
    return { error: 'Failed to refresh access token' };
  }
};

/**
 * Store authentication data in localStorage
 * @param {Object} authData - The authentication data
 */
export const storeAuthData = (authData) => {
  const { accessToken, refreshToken, expiresIn } = authData;
  
  localStorage.setItem('spotify_access_token', accessToken);
  localStorage.setItem('spotify_refresh_token', refreshToken);
  localStorage.setItem('spotify_token_timestamp', Date.now().toString());
  localStorage.setItem('spotify_expires_in', expiresIn);
};

/**
 * Get authentication data from localStorage
 * @returns {Object|null} - The authentication data or null if not found
 */
export const getStoredAuthData = () => {
  const accessToken = localStorage.getItem('spotify_access_token');
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  const timestamp = localStorage.getItem('spotify_token_timestamp');
  const expiresIn = localStorage.getItem('spotify_expires_in');
  
  if (!accessToken || !refreshToken || !timestamp || !expiresIn) {
    return null;
  }
  
  return {
    accessToken,
    refreshToken,
    timestamp: parseInt(timestamp),
    expiresIn: parseInt(expiresIn),
  };
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_timestamp');
  localStorage.removeItem('spotify_expires_in');
};

/**
 * Check if the stored token is valid
 * @returns {boolean} - True if the token is valid, false otherwise
 */
export const isTokenValid = () => {
  const authData = getStoredAuthData();
  
  if (!authData) {
    return false;
  }
  
  const { timestamp, expiresIn } = authData;
  const currentTime = Date.now();
  const tokenAge = currentTime - timestamp;
  const tokenExpiry = expiresIn * 1000; // Convert seconds to milliseconds
  
  return tokenAge < tokenExpiry;
};

/**
 * Check if the token needs to be refreshed soon (within the next 5 minutes)
 * @returns {boolean} - True if the token needs refreshing soon
 */
export const tokenNeedsRefresh = () => {
  const authData = getStoredAuthData();
  
  if (!authData) {
    return true;
  }
  
  const { timestamp, expiresIn } = authData;
  const currentTime = Date.now();
  const tokenAge = currentTime - timestamp;
  const tokenExpiry = expiresIn * 1000; // Convert seconds to milliseconds
  const refreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Return true if token will expire within the next 5 minutes
  return tokenAge > (tokenExpiry - refreshThreshold);
}; 