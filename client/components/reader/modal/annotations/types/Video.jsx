import { Button } from 'react-md';
import React from 'react';

// Components
import OpenWindow from 'components/misc/OpenWindow';

export default ({ link }) => (
  <div className="video">
    {link.indexOf('youtube.com/') > -1 ? (
      <iframe src={link} className="youtube" />
    ) : link.indexOf('vimeo.com/') > -1 ? (
      <iframe src={link} className="vimeo" />
    ) : (
      <div className="normal">
        <OpenWindow href={link}>
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

        <video src={link} controls />
      </div>
    )}
  </div>
);
