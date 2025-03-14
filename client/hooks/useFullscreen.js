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
      document.webkitFullscreenElement
    );
  }, []);

  // Function to toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    // Force check the current fullscreen state
    const isCurrentlyFullscreen = 
      document.fullscreenElement || 
      document.webkitFullscreenElement;
    
    if (!isCurrentlyFullscreen) {
      const docEl = document.documentElement;
      
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }, []);

  // Set up event listeners for fullscreen changes
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  return { isFullscreen, toggleFullscreen };
};

export default useFullscreen; 