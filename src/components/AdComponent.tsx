import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdSenseComponent: React.FC = () => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <ins
      className='adsbygoogle'
      style={{ display: 'block', zIndex: 9999999999 }}
      data-ad-client='ca-pub-9264325141836527'
      data-ad-slot='7240073021'
      data-ad-format='auto'
      data-full-width-responsive='true'
    ></ins>
  );
};

export default AdSenseComponent;
