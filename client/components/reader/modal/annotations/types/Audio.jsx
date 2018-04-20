import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default ({ annotation }) => (
  <div className="audio">
    {(Array.isArray(annotation.value)
      ? annotation.value
      : [annotation.value]
    ).map(link => <audio src={link} key={link} controls />)}
  </div>
);
