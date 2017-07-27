import React from 'react';

// Components
import Pagination from 'components/misc/Pagination';

// react-md
import Button from 'react-md/lib/Buttons/Button';

// Modules
import findMatches from 'lib/books/find-matching';
import loadCovers from 'lib/books/load-covers';
import parseQuery from 'lib/url/parse-hash-query';
import sortBooks from 'lib/books/sort';
import toUrl from 'lib/url/clean';

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
          books.map(b => {
            const url = `/${b.id}/${toUrl(b.authors)}/${toUrl(b.title)}`;
            
            return (
              <li className='book' key={b.id}>
                <a href={`#books/read${url}`}>
                  <img
                    className='cover'
                    id={`cover-${b.id}`}
                  />
                </a>
                
                <div className='info'>
                  <a
                    className='title'
                    href={`#books/read${url}`}
                  >{b.title}</a>
                  
                  <a className='authors' href={
                    `#books/list/all?search=1&authors=${
                      encodeURIComponent(b.authors)
                    }`
                  }>{b.authors}</a>
                  
                  <span className='percent-complete'>{
                    b.percent_complete + '%'
                  }</span>

                  {b.word_count > 0 ? (
                    <span className='word-count'>{
                      Math.round(b.word_count / 1000)
                    }K</span>
                  ) : null}

                  <span className='date-added'>{
                    (new Date(b.timestamp))
                      .toLocaleDateString()
                  }</span>

                  {!!(+b.rating) ? (
                    <span className='rating'>
                      <span>{b.rating}</span>
                      <span className='icon-star' />
                    </span>
                  ) : null}
                </div>

                <div className='controls'>
                  <Button
                    flat
                    label='Edit'
                    onClick={() => location.hash = `#books/manage${url}`}
                  >edit</Button>
                </div>
              </li>
            );
          })
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