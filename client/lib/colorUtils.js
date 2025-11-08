/**
 * Color utility functions for converting hex codes to color names
 */

// Common color name mappings
const colorNameMap = {
  // Black and white
  '#000000': 'Black',
  '#ffffff': 'White',
  '#fff': 'White',
  
  // Grays
  '#808080': 'Gray',
  '#a9a9a9': 'Dark Gray',
  '#c0c0c0': 'Silver',
  '#d3d3d3': 'Light Gray',
  
  // Reds
  '#ff0000': 'Red',
  '#dc143c': 'Crimson',
  '#b22222': 'Fire Brick',
  '#8b0000': 'Dark Red',
  '#ff6347': 'Tomato',
  '#ff4500': 'Orange Red',
  '#cd5c5c': 'Indian Red',
  '#f08080': 'Light Coral',
  
  // Oranges
  '#ffa500': 'Orange',
  '#ff8c00': 'Dark Orange',
  '#ff7f50': 'Coral',
  '#ff6347': 'Tomato',
  
  // Yellows
  '#ffff00': 'Yellow',
  '#ffd700': 'Gold',
  '#ffa500': 'Orange',
  '#ffef00': 'Canary Yellow',
  '#f0e68c': 'Khaki',
  
  // Greens
  '#008000': 'Green',
  '#00ff00': 'Lime',
  '#228b22': 'Forest Green',
  '#32cd32': 'Lime Green',
  '#006400': 'Dark Green',
  '#90ee90': 'Light Green',
  '#98fb98': 'Pale Green',
  '#00ff7f': 'Spring Green',
  '#2e8b57': 'Sea Green',
  '#3cb371': 'Medium Sea Green',
  
  // Blues
  '#0000ff': 'Blue',
  '#00008b': 'Dark Blue',
  '#0000cd': 'Medium Blue',
  '#4169e1': 'Royal Blue',
  '#1e90ff': 'Dodger Blue',
  '#00bfff': 'Deep Sky Blue',
  '#87ceeb': 'Sky Blue',
  '#87cefa': 'Light Sky Blue',
  '#4682b4': 'Steel Blue',
  '#191970': 'Midnight Blue',
  '#000080': 'Navy',
  
  // Purples
  '#800080': 'Purple',
  '#4b0082': 'Indigo',
  '#8b008b': 'Dark Magenta',
  '#9400d3': 'Violet',
  '#9932cc': 'Dark Violet',
  '#ba55d3': 'Medium Orchid',
  '#da70d6': 'Orchid',
  '#ee82ee': 'Violet',
  '#dda0dd': 'Plum',
  '#e6e6fa': 'Lavender',
  
  // Pinks
  '#ffc0cb': 'Pink',
  '#ff69b4': 'Hot Pink',
  '#ff1493': 'Deep Pink',
  '#dc143c': 'Crimson',
  '#ffb6c1': 'Light Pink',
  '#ffc0cb': 'Pink',
  
  // Browns
  '#a52a2a': 'Brown',
  '#8b4513': 'Saddle Brown',
  '#a0522d': 'Sienna',
  '#cd853f': 'Peru',
  '#deb887': 'Burlywood',
  '#f4a460': 'Sandy Brown',
  '#d2691e': 'Chocolate',
  '#b8860b': 'Dark Goldenrod',
  
  // Other common colors
  '#ffd700': 'Gold',
  '#c0c0c0': 'Silver',
  '#ff1493': 'Deep Pink',
  '#00ced1': 'Dark Turquoise',
  '#00fa9a': 'Medium Spring Green',
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate color distance between two RGB colors
 */
function colorDistance(rgb1, rgb2) {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

/**
 * Normalize hex color (add # if missing, handle 3-digit hex)
 */
function normalizeHex(hex) {
  if (!hex) return null;
  
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert 3-digit to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  
  // Add # back
  return '#' + hex.toLowerCase();
}

/**
 * Get color name from hex code
 * Returns the closest matching color name or a descriptive name based on RGB values
 */
export function getColorNameFromHex(hex) {
  if (!hex) return '';
  
  const normalizedHex = normalizeHex(hex);
  if (!normalizedHex) return '';
  
  // Check exact match first
  if (colorNameMap[normalizedHex]) {
    return colorNameMap[normalizedHex];
  }
  
  // Check uppercase version
  if (colorNameMap[normalizedHex.toUpperCase()]) {
    return colorNameMap[normalizedHex.toUpperCase()];
  }
  
  // Find closest match by color distance
  const targetRgb = hexToRgb(normalizedHex);
  if (!targetRgb) return '';
  
  let closestName = '';
  let minDistance = Infinity;
  
  for (const [hexColor, colorName] of Object.entries(colorNameMap)) {
    const colorRgb = hexToRgb(hexColor);
    if (colorRgb) {
      const distance = colorDistance(targetRgb, colorRgb);
      if (distance < minDistance) {
        minDistance = distance;
        closestName = colorName;
      }
    }
  }
  
  // If we found a close match (within reasonable distance), return it
  if (minDistance < 50 && closestName) {
    return closestName;
  }
  
  // Generate a descriptive name based on RGB values
  const { r, g, b } = targetRgb;
  
  // Determine dominant color
  if (r > g && r > b) {
    if (r > 200 && g < 100 && b < 100) return 'Red';
    if (r > 150 && g > 100) return 'Orange';
    if (r > 180) return 'Pink';
    return 'Reddish';
  } else if (g > r && g > b) {
    if (g > 200 && r < 100 && b < 100) return 'Green';
    if (g > 150 && r > 100) return 'Yellow';
    return 'Greenish';
  } else if (b > r && b > g) {
    if (b > 200 && r < 100 && g < 100) return 'Blue';
    if (b > 150 && r > 100) return 'Purple';
    return 'Bluish';
  } else if (r === g && g === b) {
    if (r > 200) return 'Light Gray';
    if (r > 100) return 'Gray';
    return 'Dark Gray';
  }
  
  return `#${normalizedHex.slice(1).toUpperCase()}`;
}

/**
 * Validate hex color format
 */
export function isValidHex(hex) {
  if (!hex) return false;
  const hexRegex = /^#?[0-9A-Fa-f]{3,6}$/;
  return hexRegex.test(hex);
}

