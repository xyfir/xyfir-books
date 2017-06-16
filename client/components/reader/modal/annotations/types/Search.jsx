import React from 'react';

export default ({ annotation }) => (
  <iframe
    src={'//www.bing.com/search?q=' + annotation.value}
    className='search'
  />
);