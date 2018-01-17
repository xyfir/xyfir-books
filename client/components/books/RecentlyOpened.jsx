import { FontIcon } from 'react-md';
import React from 'react';

// Components
import NoBooks from 'components/books/NoBooks';

// Modules
import loadCovers from 'lib/books/load-covers';
import sortBooks from 'lib/books/sort';
import toUrl from 'lib/url/clean';

export default class RecentlyOpened extends React.Component {

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

  render() {
    const {App} = this.props;

    if (!App.state.books.length) return <NoBooks {...this.props} />

    return (
      <ul className='recently-opened books'>{
        sortBooks(App.state.books, 'last_read', true)
          .slice(-4)
          .reverse()
          .map(b => {
            const url = `/${b.id}/${toUrl(b.authors)}/${toUrl(b.title)}`;

            return (
              <li className='book' key={b.id}>
                <a href={`#/books/read${url}`}>
                  <img
                    className='cover'
                    id={`cover-${b.id}`}
                  />
                </a>

                <div className='info'>
                  <a
                    className='title'
                    href={`#/books/read${url}`}
                  >{b.title}</a>

                  <a className='authors' href={
                    `#/books/list/all?search=1&authors=${
                      encodeURIComponent(b.authors)
                    }`
                  }>{b.authors}</a>

                  <div className='chips'>
                    <span className='chip percent-complete'>
                      {b.percent}%
                    </span>

                    {b.words > 0 ? (
                      <span className='chip word-count'>{
                        Math.round(b.words / 1000)
                      }K</span>
                    ) : null}

                    {!!(+b.rating) ? (
                      <span className='chip rating'>
                        <span>{b.rating}</span>
                        <FontIcon>stars</FontIcon>
                      </span>
                    ) : null}
                  </div>

                  <span className='last-read'>{
                    b.last_read > 0 ? (
                      'Last read on '
                      + (new Date(b.last_read))
                        .toLocaleDateString()
                    ) : (
                      'Book has not been read'
                    )
                  }</span>
                </div>
              </li>
            );
          })
      }</ul>
    );
  }

}