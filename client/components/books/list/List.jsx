import React from 'react';

// Modules
import parseHashQuery from 'lib/url/parse-query-string';

// Components
import SubGroups from 'components/books/list/SubGroups';
import All from 'components/books/list/all/All';

export default class BookList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const _view = this.props.data.view.split('/')[2];
    const view = (() => {
      switch (_view) {
        case 'TAGS':
          return (
            <SubGroups
              {...this.props}
              group='tags'
              queryKey='tag'
            />
          );
        case 'RATINGS':
          return (
            <SubGroups
              {...this.props}
              group='ratings'
              queryKey='rating'
            />
          );
        case 'SERIES':
        case 'AUTHORS':
        case 'AUTHOR_SORT':
          return <SubGroups {...this.props} group={_view.toLowerCase()} />;
        default:
          return <All {...this.props} />;
      }
    })();

    return <div className='book-list'>{view}</div>;
  }

}