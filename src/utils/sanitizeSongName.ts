export const sanitizeSongName = (songName: string): string => {
  const trimmedName = songName.trim();
  const sanitizedName = trimmedName
    .replace(/<[^>]+>/g, '')
    // Replace HTML entities (like &#39;)
    .replace(/&[#\w]+;/g, (match: string) => {
      const entityMap: Record<string, string> = {
        '&#39;': "'",
        '&amp;': '&',
        '&quot;': '"',
        '&lt;': '<',
        '&gt;': '>',
      };
      return entityMap[match] || match;
    })
    // Remove underscores
    .replace(/_/g, ' ')
    // Remove parentheticals like (music track)
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    // Trim whitespace
    .trim();
  return sanitizedName;
};
