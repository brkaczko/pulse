require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI || 'http://localhost:8888/callback'
});

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);
  
  // Determine appropriate status code
  const statusCode = err.statusCode || 500;
  
  // Create appropriate error message
  let errorMessage = 'Internal server error';
  
  if (err.statusCode === 401 || err.statusCode === 403) {
    errorMessage = 'Authentication failed. Please log in again.';
  } else if (err.statusCode === 429) {
    errorMessage = 'Rate limit exceeded. Please try again later.';
  } else if (err.body && err.body.error && err.body.error.message) {
    errorMessage = err.body.error.message;
  } else if (err.message) {
    errorMessage = err.message;
  }
  
  res.status(statusCode).json({ error: errorMessage });
};

// Login route
app.get('/login', (req, res) => {
  const scopes = ['user-read-currently-playing', 'user-read-playback-state'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({ url: authorizeURL });
});

// Callback route
app.get('/callback', async (req, res, next) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=missing_code`);
  }
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;
    
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    
    // Redirect to the frontend with tokens as query parameters
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
  } catch (err) {
    console.error('Error getting tokens:', err);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=invalid_token`);
  }
});

// Get currently playing track
app.get('/api/now-playing', async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  let access_token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    access_token = authHeader.substring(7);
  } else if (req.query.access_token) {
    // Fallback to query parameter for backward compatibility
    access_token = req.query.access_token;
  }
  
  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  spotifyApi.setAccessToken(access_token);
  
  try {
    const data = await spotifyApi.getMyCurrentPlaybackState();
    
    if (!data.body) {
      return res.json({ isPlaying: false });
    }
    
    if (!data.body.is_playing) {
      return res.json({ isPlaying: false });
    }
    
    const { item } = data.body;
    
    if (!item) {
      return res.json({ isPlaying: true, track: null });
    }
    
    res.json({
      isPlaying: true,
      track: {
        name: item.name,
        artist: item.artists.map(artist => artist.name).join(', '),
        album: item.album.name,
        albumArt: item.album.images[0]?.url,
        url: item.external_urls.spotify,
        duration: item.duration_ms,
        progress: data.body.progress_ms
      }
    });
  } catch (err) {
    next(err);
  }
});

// Refresh token
app.post('/api/refresh-token', async (req, res, next) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }
  
  spotifyApi.setRefreshToken(refresh_token);
  
  try {
    const data = await spotifyApi.refreshAccessToken();
    const { access_token, expires_in } = data.body;
    
    res.json({
      access_token,
      expires_in
    });
  } catch (err) {
    next(err);
  }
});

// Catch-all route for client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Register error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 