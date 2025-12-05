export const decodeHTML = (encodedString: string) => {
  const parser = new DOMParser();
  return parser.parseFromString(encodedString, 'text/html').body.textContent;
};

// Helper function that handles both HH:MM and HH:MM:SS formats
export const formatTimeTaken = (timeTaken: string | number | undefined): string => {
  if (!timeTaken) return '--:--';

  const str = String(timeTaken).trim();

  // Already in correct format: "04:34" or "04:34:12"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    return str;
  }

  // Check if it's just a number (total seconds or minutes)
  if (/^\d{1,6}$/.test(str)) {
    const totalSeconds = parseInt(str);

    // If number is small (< 7200 = 2 hours), assume minutes
    // If larger, assume seconds
    if (totalSeconds < 7200) {
      // Assume it's minutes (like "54")
      const minutes = totalSeconds;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    } else {
      // Assume it's seconds (like "145" seconds = 2:25)
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
        seconds,
      ).padStart(2, '0')}`;
    }
  }

  // Invalid format, return placeholder
  return '--:--';
};
