import React from 'react';

// Components
import RecentlyOpened from 'components/books/RecentlyOpened';
import AddFormat from 'components/books/AddFormat';
import BulkEdit from 'components/books/BulkEdit';
import Manage from 'components/books/Manage';
import Upload from 'components/books/Upload';
import Reader from 'components/reader/Reader';
import List from 'components/books/list/List';

export default class Books extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    switch (this.props.data.view.split('/')[1]) {
      case 'RECENTLY_OPENED':
        return <RecentlyOpened {...this.props} />;
      case 'ADD_FORMAT':
        return <AddFormat {...this.props} />;
      case 'BULK_EDIT':
        return <BulkEdit {...this.props} />;
      case 'MANAGE':
        return <Manage {...this.props} />;
      case 'UPLOAD':
        return <Upload {...this.props} />;
      case 'LIST':
        return <List {...this.props} />;
      case 'READ':
        return <Reader {...this.props} />;
    }
  }
}
