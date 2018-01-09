import React from 'react';

// Components
import Upload from 'components/library/Upload';
import Info from 'components/library/Info';

export default (props) => {
  switch (props.App.state.view.split('/')[1]) {
    case 'DOWNLOAD': return <Download {...props} />
    case 'UPLOAD': return <Upload {...props} />
    case 'INFO': return <Info {...props} />
  }
}