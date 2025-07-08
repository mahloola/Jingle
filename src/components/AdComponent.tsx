import React from 'react';

declare let adsbygoogle: any;

export default class AdComponent extends React.Component {
  componentDidMount() {
    (adsbygoogle = (window as any).adsbygoogle || []).push({});
  }

  render() {
    return (
      <ins
        className='adsbygoogle'
        style={{ display: 'block' }}
        data-ad-client='ca-pub-9264325141836527'
        data-ad-slot='7240073021'
        data-ad-format='auto'
        data-full-width-responsive='true'
      ></ins>
    );
  }
}
