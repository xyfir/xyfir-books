import marked from 'marked';
import React from 'react';

export default ({ annotation }) => (
  <div
    className='markdown-body document'
    dangerouslySetInnerHTML={{ __html:
      marked(annotation.value, { sanitize: true })
    }}
  />
);