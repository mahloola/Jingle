import React, { useEffect } from 'react';
import '../style/adComponent.css/';
interface AdSenseCommand {
  // Define known properties Google might expect
  [key: string]: unknown;
}

declare global {
  interface Window {
    adsbygoogle?: AdSenseCommand[];
  }
}

// Usage with explicit typing
const initializeAd = () => {
  const adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle = adsbygoogle;

  // Push a properly typed object
  adsbygoogle.push({
    // You can add known AdSense properties here if needed
  });
};

interface AdSenseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  adFormat?: string;
  adLayoutKey?: string;
  fullWidthResponsive?: boolean;
}

const AdSenseComponent: React.FC<AdSenseComponentProps> = ({
  className = '',
  style = {},
  adFormat = 'auto',
  adLayoutKey,
  fullWidthResponsive = true,
}) => {
  useEffect(() => {
    // Check if script is already loaded
    const scriptId = 'adsbygoogle-script';
    if (document.getElementById(scriptId)) return;

    const loadAdSense = () => {
      try {
        initializeAd();
      } catch (error) {
        console.error('AdSense error:', error);
      }
    };

    // Create and append script
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=9264325141836527`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = loadAdSense;
    document.head.appendChild(script);

    // Fallback in case onload doesn't fire
    const timeoutId = setTimeout(loadAdSense, 1000);

    return () => {
      // Cleanup
      clearTimeout(timeoutId);
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div
      className={`adsense-container ${className}`}
      style={style}
    >
      <ins
        className='adsbygoogle ad-component'
        data-ad-client='ca-pub-9264325141836527'
        data-ad-slot='7240073021'
        data-ad-format={adFormat}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
};

export default AdSenseComponent;
