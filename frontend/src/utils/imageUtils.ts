/**
 * Generate a shrine image URL
 * Returns the provided imageUrl if available, otherwise falls back to loremflickr
 * Uses shrine ID to ensure consistent images for the same shrine
 */
export const getShrineImageUrl = (shrineId: string, width: number = 400, height: number = 300, imageUrl?: string): string => {
  // If a real image URL is provided, use it
  if (imageUrl) {
    return imageUrl;
  }
  
  // Otherwise fall back to loremflickr with consistent seed
  const seed = shrineId ? Math.abs(hashCode(shrineId)) : Math.random() * 10000;
  return `https://loremflickr.com/${width}/${height}/shrine?random=${seed}`;
};

/**
 * Simple hash function to convert shrine ID to a number for consistent images
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Get a placeholder image while the actual image loads
 */
export const getPlaceholderImage = (width: number = 400, height: number = 300): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23f3f4f6' width='${width}' height='${height}'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ELoading...%3C/text%3E%3C/svg%3E`;
};
