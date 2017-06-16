import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default ({ annotation }) => (
  <div className='video'>{
    annotation.value.indexOf('youtube.com/') > -1 ? (
      <iframe
        src={annotation.value}
        className='youtube'
      />
    ) : annotation.value.indexOf('vimeo.com/') > -1 ? (
      <iframe
        src={annotation.value}
        className='vimeo'
      />
    ) : (
      <div className='normal'>
        <Button
          floating fixed secondary
          tooltipPosition='right'
          fixedPosition='bl'
          tooltipLabel='Go to source'
          onClick={() => window.open(annotation.value)}
        >link</Button>
        
        <video src={annotation.value} controls />
      </div>
    )
  }</div>
);  