import React, { useEffect, useRef, useState } from 'react';
import { getDominantColor, lightenColor, darkenColor } from '../utils/colorUtils';

/**
 * MusicVisualization component
 * Renders a circle filled with uniformly spaced dots that change color based on the current track
 * @param {Object} track - The current track information
 * @returns {JSX.Element} - Rendered component
 */
const MusicVisualization = ({ track }) => {
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [dotColor, setDotColor] = useState('rgba(255, 255, 255, 0.8)');
  
  // Update dot color when track changes
  useEffect(() => {
    const updateColor = async () => {
      if (track?.albumArt) {
        const color = await getDominantColor(track.albumArt);
        setDotColor(color);
      } else {
        setDotColor('rgba(255, 255, 255, 0.4)');
      }
    };
    
    updateColor();
  }, [track]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match container
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      createDots();
    };
    
    // Create dots in a uniform grid pattern within a circle
    const createDots = () => {
      dotsRef.current = [];
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.9; // 90% of the smaller dimension
      
      // Create a uniform grid of dots
      const spacing = radius / 15; // Adjust for dot density
      const dotSize = 3; // Fixed dot size
      
      // Calculate grid bounds
      const gridSize = radius * 2;
      const startX = centerX - radius;
      const startY = centerY - radius;
      
      // Create grid of dots
      for (let x = 0; x <= gridSize; x += spacing) {
        for (let y = 0; y <= gridSize; y += spacing) {
          const posX = startX + x;
          const posY = startY + y;
          
          // Calculate distance from center
          const distFromCenter = Math.sqrt(
            Math.pow(posX - centerX, 2) + 
            Math.pow(posY - centerY, 2)
          );
          
          // Only add dots within the circle
          if (distFromCenter <= radius) {
            // Randomize initial phase and timing for each dot
            const phase = Math.random() * Math.PI * 2;
            const speed = 0.3 + Math.random() * 0.4; // Slower speed between 0.3 and 0.7
            const delay = Math.random() * 3; // Longer random delay between 0 and 3 seconds
            
            dotsRef.current.push({
              x: posX,
              y: posY,
              radius: dotSize,
              baseColor: dotColor,
              phase,
              speed,
              delay,
              time: 0
            });
          }
        }
      }
    };
    
    // Draw all dots with animation
    const drawDots = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      dotsRef.current.forEach(dot => {
        // Update time for this dot
        dot.time += 0.016; // Approximately 60fps
        
        // Calculate pulse effect
        let pulseIntensity = 0;
        if (dot.time > dot.delay) {
          // Create a smooth sine wave for the pulse with easing
          const rawPulse = (Math.sin(dot.time * dot.speed + dot.phase) + 1) / 2;
          // Apply easing function for smoother transitions
          pulseIntensity = rawPulse * rawPulse * (3 - 2 * rawPulse);
        }
        
        // Interpolate between dark and light variations of the base color
        const darkColor = darkenColor(dot.baseColor, 0.4); // Increased contrast
        const lightColor = lightenColor(dot.baseColor, 0.4); // Increased contrast
        
        // Calculate current color based on pulse intensity with smoother transition
        const currentColor = pulseIntensity === 0 ? dot.baseColor :
          pulseIntensity < 0.5 ? 
            darkenColor(dot.baseColor, 0.4 * (1 - pulseIntensity * 2)) :
            lightenColor(dot.baseColor, 0.4 * (pulseIntensity * 2 - 1));
        
        // Draw the dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = currentColor;
        ctx.fill();
      });
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(drawDots);
    };
    
    // Initial setup
    resizeCanvas();
    animationFrameRef.current = requestAnimationFrame(drawDots);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      resizeCanvas();
    });
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [track, dotColor]); // Re-run effect when track or dotColor changes
  
  return (
    <div className="music-visualization">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default MusicVisualization; 