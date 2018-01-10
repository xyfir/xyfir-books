import * as types from 'constants/actions/settings';

/** @param {object} obj */
export function setGeneral(obj) {
  return {
    type: types.SET_GENERAL, obj
  };
}

/** @param {object} obj */
export function setBookList(obj) {
  return {
    type: types.SET_BOOK_LIST, obj
  };
}

/** @param {string} view */
export function setListView(view) {
  return {
    type: types.SET_LIST_VIEW, view
  };
}

/** @param {object} obj */
export function setReader(obj) {
  return {
    type: types.SET_READER, obj
  };
}