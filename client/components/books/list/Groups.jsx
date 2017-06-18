import React from 'react';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import List from 'react-md/lib/Lists/List';

export default class ListGroups extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const groups = [
      'All', 'Authors', 'Ratings', 'Series', 'Tags'
    ]
    .map(group => Object({
      name: group, property: group.toLowerCase(), arr: []
    }));
    
    // Count unique instances within each list group
    groups.forEach((group, i) => {
      // Count books for all
      if (i == 0) {
        groups[0].arr = this.props.data.books.map(b => b.id);
        return;
      }
      
      this.props.data.books.forEach(book => {
        // Tags group
        if (group.property == 'tags') {
          this.props.data.books.forEach(book => {
            book.tags.forEach(tag => {
              if (groups[i].arr.indexOf(tag) == -1)
                groups[i].arr.push(tag);
            });
          });
        }
        // Non-tags groups
        else {
          let val;
              
          switch (group.property) {
            case 'rating':
              val = book.rating === undefined
                ? 0 : Math.floor(book.rating);
              break;
            
            case 'series':
              if (!book.series)
                return;
              else
                val = book.series;
              break;
                
            default:
              val = book[group.property];
          }
          
          if (groups[i].arr.indexOf(val) == -1)
            groups[i].arr.push(val);
        }
      });
    });
    
    groups[1].property = 'author-sort';
    
    return (
      <List className='book-list-groups md-paper md-paper--1 section'>{
        groups.map(group =>
          <ListItem
            key={group.name}
            onClick={() => location.hash = '#books/list/' + group.property}
            primaryText={`${group.name} (${group.arr.length})`}
          />
        )
      }</List>
    );
  }

}