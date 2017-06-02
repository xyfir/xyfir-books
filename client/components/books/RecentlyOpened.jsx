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
    return (
      <div className='recently-opened old'>
        <div className='books'>{
          sortBooks(this.props.data.books, 'last_read', true)
          .slice(-4).reverse().map(book => {
            const url = '/' + book.id + '/' + toUrl(book.authors)
              + '/' + toUrl(book.title);
            
            return (
              <div
                className='book'
                onContextMenu={(e) => {
                  e.preventDefault();
                  window.location.hash = `#books/manage${url}`;
                }}
              >
                <a href={`#books/read${url}`}>
                  <img
                    className='cover'
                    id={`cover-${book.id}`}
                  />
                </a>
                
                <div className='info'>
                  <a
                    className='title'
                    href={`#books/read${url}`}
                  >{book.title}</a>
                  
                  <a className='authors' href={
                    `#books/list/all?search=1&authors=${
                      encodeURIComponent(book.authors)
                    }`
                  }>{book.authors}</a>
                  
                  <span className='percent-complete'>{
                    book.percent_complete + '%'
                  }</span>
                  
                  {book.word_count == 0 ? (
                    <span />
                  ) : (
                    <span className='word-count'>{
                      Math.round(book.word_count / 1000)
                    }K</span>
                  )}
                  {!!(+book.rating) ? (
                    <span className='rating'>
                      <span>{book.rating}</span>
                      <span className='icon-star' />
                    </span>
                  ) : (
                    <span />
                  )}
                  
                  <span className='last-read'>{
                    book.last_read > 0 ? (
                      'Last read on '
                      + (new Date(book.last_read))
                        .toLocaleDateString()
                    ) : (
                      'Book has not been read'
                    )
                  }</span>
                </div>
              </div>
            );
          })
        }</div>
      </div>
    );
  }

}