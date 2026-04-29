// Helper function to create a URL-safe string from a name
export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special characters with hyphens
    .replace(/^-+|-+$/g, '');    // Clean up any leading or trailing hyphens
};

export const timeToSeconds = (timeStr: string) => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
};

export const secondsToTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const getDistanceInMiles = (distance: number, unit: string) => {
  const normalizedUnit = unit?.toLowerCase() || '';
  
  // Convert Kilometers (5K, 3K, etc.) to Miles
  if (normalizedUnit.includes('k') || normalizedUnit === 'kilometers') {
    return distance * 0.621371;
  }
  // Convert Meters (5000m, 3200m) to Miles
  if (normalizedUnit === 'meters' || normalizedUnit === 'm') {
    return distance / 1609.344;
  }
  
  // If it's already "Miles" or "mi", just return the number
  return distance;
};

/**
 * Formats a database time string (HH:MM:SS.ms) for display.
 * Removes leading hour zeros and leading minute zeros.
 * Example: "00:18:45.0" -> "18:45.0"
 * Example: "00:08:12" -> "8:12"
 */
export const formatRaceTime = (timeStr: string | null | undefined): string => {
  if (!timeStr) return '';
  
  // 1. Remove leading "00:" for hours
  // 2. Remove a single leading "0" if it's the first character of the remaining string
  return timeStr
    .replace(/^00:/, '')
    .replace(/^0/, '');
};