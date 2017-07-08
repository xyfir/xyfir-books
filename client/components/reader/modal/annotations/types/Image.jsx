import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default ({ annotation }) => (
  <div className='image'>
    {(
      Array.isArray(annotation.value) ? annotation.value : [annotation.value]
    ).map(img =>
      <a href={img} key={img} target='_blank'><img src={img} /></a>
    )}
  </div>
);