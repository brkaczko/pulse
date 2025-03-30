/**
 * Extracts the dominant color from an image URL
 * @param {string} imageUrl - The URL of the image
 * @returns {Promise<string>} - A promise that resolves to the dominant color in rgba format
 */
export const getDominantColor = async (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to a small value for faster processing
      canvas.width = 50;
      canvas.height = 50;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Calculate average color
      let r = 0, g = 0, b = 0;
      let count = 0;
      
      // Sample every 4th pixel for better performance
      for (let i = 0; i < data.length; i += 16) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      
      // Calculate averages
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      
      // Return color in rgba format with 0.8 opacity
      resolve(`rgba(${r}, ${g}, ${b}, 0.8)`);
    };
    
    img.onerror = () => {
      // Fallback to white if image loading fails
      resolve('rgba(255, 255, 255, 0.8)');
    };
    
    img.src = imageUrl;
  });
};

/**
 * Generates a lighter variation of the given color
 * @param {string} color - The base color in rgba format
 * @param {number} amount - Amount to lighten (0-1)
 * @returns {string} - The lightened color in rgba format
 */
export const lightenColor = (color, amount) => {
  const rgba = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!rgba) return color;
  
  const r = Math.min(255, Math.round(parseInt(rgba[1]) + (255 - parseInt(rgba[1])) * amount));
  const g = Math.min(255, Math.round(parseInt(rgba[2]) + (255 - parseInt(rgba[2])) * amount));
  const b = Math.min(255, Math.round(parseInt(rgba[3]) + (255 - parseInt(rgba[3])) * amount));
  const a = parseFloat(rgba[4]);
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Generates a darker variation of the given color
 * @param {string} color - The base color in rgba format
 * @param {number} amount - Amount to darken (0-1)
 * @returns {string} - The darkened color in rgba format
 */
export const darkenColor = (color, amount) => {
  const rgba = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!rgba) return color;
  
  const r = Math.round(parseInt(rgba[1]) * (1 - amount));
  const g = Math.round(parseInt(rgba[2]) * (1 - amount));
  const b = Math.round(parseInt(rgba[3]) * (1 - amount));
  const a = parseFloat(rgba[4]);
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}; 