import { Button } from 'react-md';
import React from 'react';

// Components
import OpenWindow from 'components/misc/OpenWindow';

export default ({ annotation }) => (
  <div className="link">
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
);
