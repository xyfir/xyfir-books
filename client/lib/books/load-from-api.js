import request from 'superagent';

// Constants
import { LIBRARY } from 'constants/config';

// Action creators
import { loadBooks } from 'actions/creators/books';
import { save } from 'actions/creators/index';

/**
 * Pull annotations from stored books and merge with books downloaded from API.
 * @async
 * @param {object[]} books
 * @return {object[]}
 */
async function mergeAnnotations(books) {

  try {
    const storedBooks = await localforage.getItem('books');

    if (!storedBooks) return books;

    storedBooks.forEach(sb => {
      if (sb.annotations && sb.annotations.length) {
        books.forEach((book, i) => {
          if (sb.id == book.id) {
            books[i].annotations = sb.annotations;
          }
        });
      }
    });

    return books;
  }
  catch (err) {
    console.error('lib/books/load-from-api mergeAnnotations', err);
    return books;
  }

}

/**
 * Load an array of all books in the library.
 * @async
 * @param {string} library
 * @param {function} [dispatch]
 * @return {object[]}
 */
export default async function(library, dispatch) {

  try {
    let res = await request.get('/api/books');
    let books1 = res.body.books;

    res = await request.get(`${LIBRARY}libraries/${library}/books`);
    let books2 = res.body.books;

    if (!books1.length) return [];

    // Merge books1 and books2
    let books = books1
      .map(b1 => {
        const b2 = books2.find(b2 => b1.id == b2.id) || {};

        Object.assign(b2, b1);

        b2.versions = {
          metadata: b2.version_metadata,
          cover: b2.version_cover
        };
        delete b2.version_metadata, delete b2.version_cover;

        return b2;
      })
      .filter(b => b.title !== undefined);

    res = books1 = books2 = null;

    // Merge annotations from books saved to local storage
    books = await mergeAnnotations(books);

    if (dispatch) {
      // Load books into state and save books[] to local storage
      dispatch(loadBooks(books));
      dispatch(save('books'));
    }

    return books;
  }
  catch (err) {
    console.error('lib/books/load-from-api', err);
    return [];
  }

}