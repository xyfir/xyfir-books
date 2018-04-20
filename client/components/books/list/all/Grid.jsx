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

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default class GridList extends React.Component {
  constructor(props) {
    super(props);

    this.state = { selected: -1 };
  }

  componentDidMount() {
    const { books, account } = this.props.App.state;
    loadCovers(books, account.library);
  }

  componentDidUpdate() {
    const { books, account } = this.props.App.state;
    loadCovers(books, account.library);
  }

  render() {
    const { App } = this.props;

    if (!App.state.books.length) return <NoBooks {...this.props} />;

    let books = sortBooks(
      findMatches(App.state.books, App.state.search.query),
      'timestamp',
      false
    );
    const booksCount = books.length;

    books = books.splice((App.state.search.page - 1) * 25, 25);

    return (
      <div>
        <ul className="list-grid">
          {books.map(b => (
            <li
              className="book"
              onClick={() => this.setState({ selected: b.id })}
              key={b.id}
            >
              {this.state.selected == b.id ? (
                <div className="overlay">
                  <Button
                    flat
                    onClick={() => (location.hash = buildUrl(b, 'read'))}
                    iconChildren="book"
                  >
                    Read
                  </Button>
                  <Button
                    flat
                    onClick={() => (location.hash = buildUrl(b, 'manage'))}
                    iconChildren="edit"
                  >
                    Metadata
                  </Button>
                  <Button
                    flat
                    onClick={() => (location.hash = buildUrl(b, 'authors'))}
                    iconChildren="person"
                  >
                    Search author(s)
                  </Button>
                  <Button
                    flat
                    onClick={() => deleteBook([b.id], App)}
                    iconChildren="delete"
                  >
                    Delete
                  </Button>
                </div>
              ) : null}

              <img className="cover" id={`cover-${b.id}`} />

              <span className="title">{b.title}</span>
              <span className="authors">{b.authors}</span>
            </li>
          ))}
        </ul>

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
