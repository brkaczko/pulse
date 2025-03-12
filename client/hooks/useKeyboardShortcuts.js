import { useEffect, useCallback } from 'react';

/**
 * Custom hook to handle keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to handler functions
 * @returns {void}
 */
const useKeyboardShortcuts = (shortcuts) => {
  const handleKeyDown = useCallback((e) => {
    // Process each shortcut
    Object.entries(shortcuts).forEach(([key, handler]) => {
      const [modifier, keyName] = key.split('+');
      
      // Check if the shortcut matches the key event
      if (
        ((modifier === 'Ctrl' && e.ctrlKey) || 
         (modifier === 'Cmd' && e.metaKey) || 
         (modifier === 'Alt' && e.altKey) || 
         (modifier === 'Shift' && e.shiftKey)) && 
        e.key.toLowerCase() === keyName.toLowerCase()
      ) {
        e.preventDefault();
        handler(e);
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts; 