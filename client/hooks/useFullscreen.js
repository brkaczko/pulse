import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle fullscreen functionality
 * @returns {Object} - Object containing isFullscreen state and toggleFullscreen function
 */
const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Function to handle fullscreen change events
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement
    );
  }, []);

  // Function to toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    // Force check the current fullscreen state
    const isCurrentlyFullscreen = 
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement;
    
    if (!isCurrentlyFullscreen) {
      const docEl = document.documentElement;
      
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }, []);

  // Set up event listeners for fullscreen changes
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  return { isFullscreen, toggleFullscreen };
};

export default useFullscreen; 