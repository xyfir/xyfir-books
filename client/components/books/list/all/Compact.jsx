import React from 'react';

// Components
import Pagination from 'components/misc/Pagination';

// react-md
import MenuButton from 'react-md/lib/Menus/MenuButton';
import ListItem from 'react-md/lib/Lists/ListItem';
import FontIcon from 'react-md/lib/FontIcons';

// Modules
import findMatches from 'lib/books/find-matching';
import loadCovers from 'lib/books/load-covers';
import parseQuery from 'lib/url/parse-hash-query';
import deleteBook from 'lib/books/delete';
import sortBooks from 'lib/books/sort';
import buildUrl from 'lib/url/build';

export default class CompactList extends React.Component {

  constructor(props) {
    super(props);
  }
  
  componentDidMount() {
    loadCovers(this.props.data.books, this.props.data.account.library);
  }
  
  componentDidUpdate() {
    loadCovers(this.props.data.books, this.props.data.account.library);
  }

  onListItemClick(e, b, u) {
    e.stopPropagation();
    location.hash = buildUrl(b, u);
  }

  render() {
    const q = parseQuery();
    
    let books = sortBooks(
      findMatches(this.props.data.books, this.props.data.search.query),
      'title', true
    );
    const booksCount = books.length;

    if (!booksCount) return <p>You don't have any books!</p>;
    
    books = books.splice((this.props.data.search.page - 1) * 25, 25);

    return (
      <div>
        <ul className='list-compact'>{
          books.map(b =>
            <li
              key={b.id}
              onClick={() => location.hash = buildUrl(b, 'read')}
              className='book'
            >
              <img
                className='cover'
                id={`cover-${b.id}`}
              />
              
              <div className='info'>
                <span className='title'>{b.title}</span>
                <span className='authors'>{b.authors}</span>
                
                <span className='chip percent-complete'>
                  {b.percent_complete}%
                </span>

                {b.word_count > 0 ? (
                  <span className='chip word-count'>
                    {Math.round(b.word_count / 1000)}K
                  </span>
                ) : null}

                <span className='chip date-added'>{
                  (new Date(b.timestamp)).toLocaleDateString()
                }</span>

                {!!(+b.rating) ? (
                  <span className='chip rating'>
                    <span>{b.rating}</span>
                    <span className='icon-star' />
                  </span>
                ) : null}

                <MenuButton
                  icon
                  buttonChildren='more_vert'
                  tooltipLabel='Open menu'
                  onClick={e => e.stopPropagation()}
                >
                  <ListItem
                    primaryText='Read'
                    leftIcon={<FontIcon>book</FontIcon>}
                    onClick={e => this.onListItemClick(e, b, 'read')}
                  />
                  <ListItem
                    primaryText='Metadata'
                    leftIcon={<FontIcon>edit</FontIcon>}
                    onClick={e => this.onListItemClick(e, b, 'manage')}
                  />
                  <ListItem
                    primaryText='Search author(s)'
                    leftIcon={<FontIcon>person</FontIcon>}
                    onClick={e => this.onListItemClick(e, b, 'authors')}
                  />
                  <ListItem
                    primaryText='Delete'
                    leftIcon={<FontIcon>delete</FontIcon>}
                    onClick={e =>
                     !e.stopPropagation() &&
                     deleteBook([b.id], this.props.dispatch)
                    }
                  />
                </MenuButton>
              </div>
            </li>
          )
        }</ul>

        <Pagination
          itemsPerPage={25}
          dispatch={this.props.dispatch}
          items={booksCount} 
          data={this.props.data}
        />
      </div>
    );
  }

}