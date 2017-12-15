import React from 'react';

// Modules
import parseHashQuery from 'lib/url/parse-query-string';

// Components
import SubGroups from 'components/books/list/SubGroups';
import Groups from 'components/books/list/Groups';
import All from 'components/books/list/all/All';

export default class BookList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const view = (() => {
      switch (this.props.data.view.split('/')[2]) {
        case 'ALL':
          return <All {...this.props} />;
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
          return <SubGroups {...this.props} group='series' />;
        case 'AUTHORS':
          return <SubGroups {...this.props} group='authors' />;
        case 'AUTHOR_SORT':
          return <SubGroups {...this.props} group='author_sort' />;
        default:
          return <Groups {...this.props} />;
      }
    })();
    
    return <div className='book-list'>{view}</div>;
  }

}