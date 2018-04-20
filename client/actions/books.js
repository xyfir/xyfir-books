import * as types from 'constants/actions/books';

/**
 * @param {number} id
 * @param {string} format
 */
export function addFormat(id, format) {
  return {
    type: types.ADD_FORMAT,
    id,
    format
  };
}

/** @param {number[]} ids */
export function deleteBooks(ids) {
  return {
    type: types.DELETE_BOOKS,
    ids
  };
}

/** @param {object[]} books */
export function loadBooks(books) {
  return {
    type: types.LOAD_BOOKS,
    books
  };
}

/**
 * @param {number} id
 * @param {string} format
 */
export function deleteFormat(id, format) {
  return {
    type: types.DELETE_FORMAT,
    id,
    format
  };
}

/**
 * @param {number} id
 * @param {object} obj
 */
export function updateBook(id, obj) {
  return {
    type: types.UPDATE_BOOK,
    id,
    obj
  };
}
