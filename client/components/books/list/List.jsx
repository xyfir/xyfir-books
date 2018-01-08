import React from 'react';

// Components
import SubGroups from 'components/books/list/SubGroups';
import All from 'components/books/list/all/All';

export default (props) => {
  const view = props.App.state.view.split('/')[2];

  switch (view) {
    case 'TAGS': return (
      <SubGroups
        {...props}
        group='tags'
        queryKey='tag'
      />
    )
    case 'RATINGS': return (
      <SubGroups
        {...props}
        group='ratings'
        queryKey='rating'
      />
    )
    case 'SERIES':
    case 'AUTHORS':
    case 'AUTHOR_SORT':
      return <SubGroups {...props} group={view.toLowerCase()} />
    default:
      return <All {...props} />
  }
};