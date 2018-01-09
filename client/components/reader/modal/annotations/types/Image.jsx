import { Button } from 'react-md';
import React from 'react';

// Components
import OpenWindow from 'components/misc/OpenWindow';

export default ({ annotation }) => (
  <div className='image'>
    {(
      Array.isArray(annotation.value) ? annotation.value : [annotation.value]
    ).map(img =>
      <OpenWindow href={img} key={img}><img src={img} /></OpenWindow>
    )}
  </div>
);