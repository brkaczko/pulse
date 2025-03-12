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
  redirectUri: process.env.REDIRECT_URI
});

// Login route
app.get('/login', (req, res) => {
  const scopes = ['user-read-currently-playing', 'user-read-playback-state'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({ url: authorizeURL });
});

// Callback route
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;
    
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    
    // Redirect to the frontend with tokens as query parameters
    res.redirect(`http://localhost:3000?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
  } catch (err) {
    console.error('Error getting tokens:', err);
    res.redirect('http://localhost:3000?error=invalid_token');
  }
});

// Get currently playing track
app.get('/api/now-playing', async (req, res) => {
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  spotifyApi.setAccessToken(access_token);
  
  try {
    const data = await spotifyApi.getMyCurrentPlaybackState();
    
    if (!data.body || !data.body.is_playing) {
      return res.json({ isPlaying: false });
    }
    
    const { item } = data.body;
    
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
    console.error('Error getting current playback:', err);
    res.status(500).json({ error: 'Failed to fetch currently playing track' });
  }
});

// Refresh token
app.post('/api/refresh-token', async (req, res) => {
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
    console.error('Error refreshing token:', err);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Catch-all route for client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 