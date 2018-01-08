import * as views from 'actions/types/index';

/** @param {string} view */
export function changeView(view) {
  return { type: views.SET_VIEW, view };
}

/** @param {string} query */
export function setSearch(query) {
  return { type: views.SET_SEARCH, query };
}

/** @param {number} page */
export function setPage(page) {
  return { type: views.SET_PAGE, page };
}

/** @param {string|string[]} prop */
export function save(prop) {
  return { type: views.SET_SAVE, prop: Array.isArray(prop) ? prop : [prop] };
}

/**
 * Acts like React's `setState()`.
 * @param {object}
 */
export function setState(state) {
  return { type: views.SET_STATE, state };
}