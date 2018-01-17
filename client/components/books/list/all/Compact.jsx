import { MenuButton, FontIcon, ListItem } from 'react-md';
import React from 'react';

// Components
import Pagination from 'components/misc/Pagination';
import NoBooks from 'components/books/NoBooks';

// Modules
import findMatches from 'lib/books/find-matching';
import loadCovers from 'lib/books/load-covers';
import deleteBook from 'lib/books/delete';
import sortBooks from 'lib/books/sort';
import buildUrl from 'lib/url/build';

export default class CompactList extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {books, account} = this.props.App.state;
    loadCovers(books, account.library);
  }

  componentDidUpdate() {
    const {books, account} = this.props.App.state;
    loadCovers(books, account.library);
  }

  onListItemClick(e, b, u) {
    e.stopPropagation();
    location.hash = buildUrl(b, u);
  }

  render() {
    const {App} = this.props;

    if (!App.state.books.length) return <NoBooks {...this.props} />

    let books = sortBooks(
      findMatches(App.state.books, App.state.search.query),
      'last_read', true
    );
    const booksCount = books.length;

    books = books.splice((App.state.search.page - 1) * 25, 25);

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

                <div className='chips'>
                  <span className='chip percent-complete'>
                    {b.percent}%
                  </span>

                  {b.words > 0 ? (
                    <span className='chip word-count'>
                      {Math.round(b.words / 1000)}K
                    </span>
                  ) : null}

                  <span className='chip date-added'>{
                    (new Date(b.timestamp)).toLocaleDateString()
                  }</span>

                  {!!(+b.rating) ? (
                    <span className='chip rating'>
                      <span>{b.rating}</span>
                      <FontIcon>stars</FontIcon>
                    </span>
                  ) : null}
                </div>

                <MenuButton
                  icon primary
                  id='menu--set-tools'
                  onClick={e => e.stopPropagation()}
                  menuItems={[
                    <ListItem
                      primaryText='Read'
                      leftIcon={<FontIcon>book</FontIcon>}
                      onClick={e => this.onListItemClick(e, b, 'read')}
                    />,
                    <ListItem
                      primaryText='Metadata'
                      leftIcon={<FontIcon>edit</FontIcon>}
                      onClick={e => this.onListItemClick(e, b, 'manage')}
                    />,
                    <ListItem
                      primaryText='Search author(s)'
                      leftIcon={<FontIcon>person</FontIcon>}
                      onClick={e => this.onListItemClick(e, b, 'authors')}
                    />,
                    <ListItem
                      primaryText='Delete'
                      leftIcon={<FontIcon>delete</FontIcon>}
                      onClick={e =>
                        !e.stopPropagation() &&
                        deleteBook([b.id], App)
                      }
                    />
                  ]}
                  tooltipLabel='Open menu'
                  iconChildren='more_vert'
                />
              </div>
            </li>
          )
        }</ul>

        <Pagination
          itemsPerPage={25}
          dispatch={App.store.dispatch}
          items={booksCount}
          data={App.state}
        />
      </div>
    );
  }

}