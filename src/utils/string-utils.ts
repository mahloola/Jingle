import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity';

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

export const calcGradientColor = ({
  val,
  min,
  max,
}: {
  val: number;
  min: number;
  max: number;
}): string => {
  const normalized = Math.min(Math.max((val - min) / (max - min), 0), 1);

  // RGB values for our gradient stops
  const colors = [
    { r: 200, g: 0, b: 0 },
    { r: 237, g: 253, b: 7 }, // Yellow at 0.5
    { r: 0, g: 200, b: 0 },
  ];

  let r, g, b;

  if (normalized <= 0.5) {
    // Between green and yellow
    const ratio = normalized * 2;
    r = Math.round(colors[0].r + (colors[1].r - colors[0].r) * ratio);
    g = Math.round(colors[0].g + (colors[1].g - colors[0].g) * ratio);
    b = Math.round(colors[0].b + (colors[1].b - colors[0].b) * ratio);
  } else {
    // Between yellow and red
    const ratio = (normalized - 0.5) * 2;
    r = Math.round(colors[1].r + (colors[2].r - colors[1].r) * ratio);
    g = Math.round(colors[1].g + (colors[2].g - colors[1].g) * ratio);
    b = Math.round(colors[1].b + (colors[2].b - colors[1].b) * ratio);
  }

  return `rgb(${r}, ${g}, ${b})`;
};

export const filterProfanityFromWord = (msg: string) => {
  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  const censor = new TextCensor();
  const matches = matcher.getAllMatches(msg);
  const censoredText = censor.applyTo(msg, matches);
  return censoredText;
};

export const checkProfanity = (msg: string) => {
  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  const matches = matcher.getAllMatches(msg);
  console.log(!!matches.length);
  return !!matches.length;
};
