import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= breakpoint,
  );

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
}
