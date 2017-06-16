import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default ({ annotation }) => (
  <div className='audio'>
    <Button
      floating fixed secondary
      tooltipPosition='right'
      fixedPosition='bl'
      tooltipLabel='Go to source'
      onClick={() => window.open(annotation.value)}
    >link</Button>

    <audio src={annotation.value} controls />
  </div>
);