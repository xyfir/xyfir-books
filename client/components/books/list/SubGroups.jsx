import React from 'react';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import List from 'react-md/lib/Lists/List';

// Components
import Search from 'components/misc/Search';

// Modules
import findListItems from 'lib/books/find-list-items';

export default class BookListSubGroups extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const subgroups = {/* 'subgroup': booksCount */};
    
    this.props.data.books.forEach(book => {
      if (this.props.group == 'ratings') {
        const rating = book.rating === undefined
          ? 'Unrated' : book.rating === 0
          ? 'No Stars' : Math.floor(book.rating) + ' Stars'; 
        
        if (subgroups[rating] === undefined)
          subgroups[rating] = 1;
        else
          subgroups[rating]++;
      }
      else if (this.props.group == 'tags') {
        book.tags.forEach(tag => {
          if (subgroups[tag] === undefined)
            subgroups[tag] = 1;
          else
            subgroups[tag]++;
        });
      }
      else {
        if (book[this.props.group] === undefined)
          return;
        if (subgroups[book[this.props.group]] === undefined)
          subgroups[book[this.props.group]] = 1;
        else
          subgroups[book[this.props.group]]++;
      }
    });
    
    return (
      <div className='book-list-subgroup'>
        <Search {...this.props} />
        
        <List className='md-paper md-paper--1 section'>{
          findListItems(
            subgroups, this.props.data.search.query
          ).map(subgroup =>
            <ListItem
              key={subgroup}
              onClick={() => location.hash =
                '#/books/list/all?search=1&' +
                (this.props.queryKey || this.props.group) +
                '=' + encodeURIComponent(subgroup)
              }
              primaryText={subgroup}
              secondaryText={subgroups[subgroup] + ' books'}
            />
          )
        }</List>
      </div>
    );
  }

}