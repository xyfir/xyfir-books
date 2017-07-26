import request from 'superagent';

// Constants
import { LIBRARY } from 'constants/config';

// Action creators
import { loadBooks } from 'actions/creators/books';
import { save } from 'actions/creators/index';

/**
 * Pull annotations from stored books and merge with books downloaded from api.
 * @param {object[]} books
 * @returns {Promise} Resolves to books array.
 */
function mergeAnnotations(books) {
  
  return new Promise(resolve =>
    localforage.getItem('books')
      .then(storedBooks => {
        if (!storedBooks) throw '';

        storedBooks.forEach(sb => {
          if (sb.annotations && sb.annotations.length) {
            books.forEach((book, i) => {
              if (sb.id == book.id) {
                books[i].annotations = sb.annotations;
              }
            });
          }
        });

        resolve(books);
      })
      .catch(err => resolve(books))
  );

}

/**
 * Load an array of all books in the library.
 * @param {string} library 
 * @param {function} dispatch 
 * @param {function} [fn] 
 */
export default function(library, dispatch, fn) {
  
  let books1;

  // Get from Xyfir Books DB
  request
    .get('../api/books')
    .then(res => {
      books1 = res.body.books;
      
      return request.get(`${LIBRARY}libraries/${library}/books`);
    })
    .then(res => {
      let books2 = res.body.books;
      
      if (!books1.length) return [];

      const books = books1
        .map(b1 => {
          const b2 = books2.find(b2 => b1.id == b2.id) || {};
          
          Object.assign(b2, b1);
          
          b2.versions = {
            metadata: b2.version_metadata,
            cover: b2.version_cover
          };
          delete b2.version_metadata; delete b2.version_cover;
          
          return b2;
        })
        .filter(b => b.title !== undefined);
      
      books1 = null, books2 = null;
      
      // Merge annotations from books saved to local storage
      return mergeAnnotations(books);
    })
    .then(books => {
      if (fn === undefined) {
        // Load books into state and save books[] to local storage
        dispatch(loadBooks(books));
        dispatch(save('books'));
      }
      else {
        fn(books);
      }
    })
    .catch(err => 1);
  
}