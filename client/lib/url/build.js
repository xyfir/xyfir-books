import clean from 'lib/url/clean';

/**
 * Builds the requested url using the provided data.
 * @param {object} book
 * @param {string} type
 * @return {string}
 */
export default function(book, type) {

  switch (type) {
    case 'read':
      return '#books/read/' +
        `${book.id}/${clean(book.authors)}/${clean(book.title)}`;
    case 'manage':
      return '#books/manage/' +
        `${book.id}/${clean(book.authors)}/${clean(book.title)}`;
    case 'authors':
      return '#books/list/all?search=1&authors=' +
        encodeURIComponent(book.authors);
  }

}