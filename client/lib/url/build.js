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
    case 'manage':
    case 'add-format':
      return `#/books/${type}/` +
        `${book.id}/${clean(book.authors)}/${clean(book.title)}`;

    case 'authors':
      return '#/books/list/all?search=1&authors=' +
        encodeURIComponent(book.authors);
  }

}