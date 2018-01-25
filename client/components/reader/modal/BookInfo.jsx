import React from 'react';

// Components
import Navigation from 'components/reader/modal/Navigation';

export default class BookInfo extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {book} = this.props.Reader.state;

    return (
      <section className='book-info'>
        <Navigation {...this.props} title='Book Info' />

        <table><tbody>
          <tr>
            <th>Title</th>
            <td>{book.title}</td>
          </tr>

          <tr>
            <th>Authors</th>
            <td>{book.authors}</td>
          </tr>

          <tr>
            <th>Publisher</th>
            <td>{book.publisher}</td>
          </tr>

          <tr>
            <th>Published</th>
            <td>{(book.pubdate || '').split('T')[0]}</td>
          </tr>

          <tr>
            <th>Added</th>
            <td>{book.timestamp.split('T')[0]}</td>
          </tr>

          <tr>
            <th>Tags</th>
            <td>{book.tags.map(tag =>
              <span className='tag'>{tag}</span>
            )}</td>
          </tr>

          <tr>
            <th>Series</th>
            <td>{book.series}</td>
          </tr>
        </tbody></table>

        <div
          className='comments'
          dangerouslySetInnerHTML={{__html: book.comments }}
        />
      </section>
    );
  }

}