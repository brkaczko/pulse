import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to track user activity
 * @param {number} inactivityThreshold - Time in milliseconds after which user is considered inactive
 * @returns {Object} - Object containing isActive state and handleActivity function
 */
const useUserActivity = (inactivityThreshold = 5 * 60 * 1000) => {
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Function to handle user activity
  const handleActivity = useCallback(() => {
    setIsActive(true);
    setLastActivity(Date.now());
  }, []);

  // Set up event listeners for user activity
  useEffect(() => {
    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    // Check if user is inactive after the threshold
    const inactivityTimer = setInterval(() => {
      if (Date.now() - lastActivity > inactivityThreshold) {
        setIsActive(false);
      }
    }, 60 * 1000); // Check every minute
    
    return () => {
      // Remove event listeners
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      clearInterval(inactivityTimer);
    };
  }, [handleActivity, lastActivity, inactivityThreshold]);

  return { isActive, handleActivity, lastActivity };
};

export default useUserActivity; 