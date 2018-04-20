import { Button } from 'react-md';
import React from 'react';

// Components
import OpenWindow from 'components/misc/OpenWindow';

export default ({ annotation }) =>
  annotation.value.indexOf('http') == 0 ? (
    <div className="map">
      <OpenWindow href={annotation.value}>
        <Button
          floating
          fixed
          secondary
          tooltipPosition="right"
          fixedPosition="bl"
          tooltipLabel="Go to source"
          iconChildren="link"
        />
      </OpenWindow>

      <iframe src={annotation.value} />
    </div>
  ) : (
    <div className="map">
      <iframe
        src={
          'https://www.google.com/maps/embed/v1/place' +
          '?key=AIzaSyAezY_0Z_q0G_WPm-UXwkGmLBYURLLDKfE' +
          '&q=' +
          encodeURIComponent(annotation.value) +
          '&maptype=satellite'
        }
        className="gmaps"
      />
    </div>
  );
