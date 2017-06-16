import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default ({ annotation }) =>
  annotation.value.indexOf('http') == 0 ? (
    <div className='map'>
      <Button
        floating fixed secondary
        tooltipPosition='right'
        fixedPosition='bl'
        tooltipLabel='Go to source'
        onClick={() => window.open(annotation.value)}
      >link</Button>

      <iframe src={annotation.value} />
    </div>
  ) : (
    <div className='map'>
      <iframe
        src={
          'https://www.google.com/maps/embed/v1/place' +
          '?key=AIzaSyAezY_0Z_q0G_WPm-UXwkGmLBYURLLDKfE' +
          '&q=' + annotation.value
        }
        className='gmaps'
      />
    </div>
  );