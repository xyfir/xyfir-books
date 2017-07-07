import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default ({ link }) => (
  <div className='video'>{
    link.indexOf('youtube.com/') > -1 ? (
      <iframe
        src={link}
        className='youtube'
      />
    ) : link.indexOf('vimeo.com/') > -1 ? (
      <iframe
        src={link}
        className='vimeo'
      />
    ) : (
      <div className='normal'>
        <Button
          floating fixed secondary
          tooltipPosition='right'
          fixedPosition='bl'
          tooltipLabel='Go to source'
          onClick={() => window.open(link)}
        >link</Button>
        
        <video src={link} controls />
      </div>
    )
  }</div>
);  