import * as types from 'constants/actions/settings';

/** @param {object} obj */
export function setBookList(obj) {
  return {
    type: types.SET_BOOK_LIST, obj
  };
}

/** @param {string} theme */
export function setTheme(theme) {
  return {
    type: types.SET_THEME, theme
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