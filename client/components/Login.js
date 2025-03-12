import React, { useState, useEffect } from 'react';

const Login = ({ error }) => {
  const [loginUrl, setLoginUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoginUrl = async () => {
      try {
        const response = await fetch('/login');
        const data = await response.json();
        setLoginUrl(data.url);
      } catch (err) {
        console.error('Error fetching login URL:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginUrl();
  }, []);

  return (
    <div className="container">
      <div className="login-container">
        <img 
          src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" 
          alt="Spotify Logo" 
          className="logo" 
        />
        <h1>Pulse</h1>
        <p>See what's currently playing on your Spotify account</p>
        
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <a href={loginUrl}>
            <button className="login-button">Connect with Spotify</button>
          </a>
        )}
        
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default Login; 