import request from 'superagent';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

// Action creators
import { loadBooks } from 'actions/books';
import { save } from 'actions/app';

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
    let res = await request.get(`${XYLIBRARY_URL}/libraries/${library}/books`);
    let {books} = res.body;
    res = null;

    if (!books.length) return [];

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