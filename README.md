# Pulse

A web application for real-time audio visualization.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **API**: Spotify Web API
- **Build Tools**: Webpack, Babel

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Spotify Developer Account

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/brkaczko/pulse.git
   cd pulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Spotify Developer Application:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Create a new application
   - Set the redirect URI to `http://localhost:8888/callback`
   - Note your Client ID and Client Secret

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Spotify Client ID and Client Secret

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Project Structure

```
pulse/
├── client/               # Frontend code
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── index.html        # HTML template
│   ├── index.js          # Entry point
│   └── styles.css        # Global styles
├── server/               # Backend code
│   └── index.js          # Express server
├── .babelrc              # Babel configuration
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore file
├── package.json          # Dependencies and scripts
├── README.md             # Project documentation
└── webpack.config.js     # Webpack configuration
```

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/) 