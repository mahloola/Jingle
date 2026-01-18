import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(() => {
    // Check if it's a mobile device by user agent AND screen size
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= breakpoint;

    // Mobile in portrait OR mobile device in landscape with small height
    return isSmallScreen || (isMobileDevice && window.innerHeight <= breakpoint);
  });

  useEffect(() => {
    const onResize = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= breakpoint;

      setIsMobile(isSmallScreen || (isMobileDevice && window.innerHeight <= breakpoint));
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
}
