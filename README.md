# Pulse

A minimalist widget that displays your currently playing Spotify track in real-time.

## Features

- Spotify authentication using OAuth 2.0
- Real-time display of currently playing track
- Track progress bar that updates in real-time
- Compact widget design in the bottom right corner
- Fullscreen mode for immersive viewing
- Persistent login using localStorage

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Spotify account
- A Spotify Developer account with a registered application

## Setup

1. Clone this repository:
   ```
   git clone <repository-url>
   cd pulse
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a Spotify Developer Application:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Log in with your Spotify account
   - Click "Create an App"
   - Fill in the app name and description
   - Set the Redirect URI to `http://localhost:8888/callback`
   - Save your Client ID and Client Secret

4. Create a `.env` file in the root directory with the following content:
   ```
   CLIENT_ID=your_spotify_client_id
   CLIENT_SECRET=your_spotify_client_secret
   REDIRECT_URI=http://localhost:8888/callback
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click "Connect with Spotify" to authenticate with your Spotify account
2. Grant the necessary permissions
3. Start playing music on any of your Spotify-connected devices
4. The app will display your currently playing track with album art, track name, artist, and progress

## Building for Production

To build the application for production:

```
npm run build
```

Then start the server:

```
npm start
```

## Technologies Used

- React
- Node.js
- Express
- Spotify Web API
- Webpack
- Babel

## License

MIT 