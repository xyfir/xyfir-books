import React from 'react';

// Components
import BookList from 'components/settings/BookList';
import General from 'components/settings/General';
import Reader from 'components/settings/Reader';

export default props => {
  switch (props.data.view.split('/')[1]) {
    case 'BOOK_LIST': return <BookList {...props} />
    case 'GENERAL': return <General {...props} />
    case 'READER': return <Reader {...props} />
  }
}