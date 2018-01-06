import { FontIcon } from 'react-md';
import React from 'react';

// Modules
import loadCovers from 'lib/books/load-covers';
import sortBooks from 'lib/books/sort';
import toUrl from 'lib/url/clean';

export default class RecentlyOpened extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    loadCovers(this.props.data.books, this.props.data.account.library);
  }

  componentDidUpdate() {
    loadCovers(this.props.data.books, this.props.data.account.library);
  }

  render() {
    if (!this.props.data.books.length) return <p>You don't have any books!</p>;

    return (
      <ul className='recently-opened books'>{
        sortBooks(this.props.data.books, 'last_read', true)
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
                      {b.percent_complete}%
                    </span>

                    {b.word_count > 0 ? (
                      <span className='chip word-count'>{
                        Math.round(b.word_count / 1000)
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