import * as types from 'constants/actions/app';

/** @param {string} view */
export function changeView(view) {
  return { type: types.SET_VIEW, view };
}

/** @param {string} query */
export function setSearch(query) {
  return { type: types.SET_SEARCH, query };
}

/** @param {number} page */
export function setPage(page) {
  return { type: types.SET_PAGE, page };
}

/** @param {string|string[]} prop */
export function save(prop) {
  return { type: types.SET_SAVE, prop: Array.isArray(prop) ? prop : [prop] };
}

/**
 * Acts like React's `setState()`.
 * @param {object}
 */
export function setState(state) {
  return { type: types.SET_STATE, state };
}