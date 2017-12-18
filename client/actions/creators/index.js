import {
  CHANGE_VIEW, SET_SEARCH, SET_SAVE, SET_PAGE
} from 'actions/types/index';

/** @param {string} view */
export function changeView(view) {
  return { type: CHANGE_VIEW, view };
}

/** @param {string} query */
export function setSearch(query) {
  return { type: SET_SEARCH, query };
}

/** @param {number} page */
export function setPage(page) {
  return { type: SET_PAGE, page };
}

/** @param {string|string[]} prop */
export function save(prop) {
  return { type: SET_SAVE, prop: Array.isArray(prop) ? prop : [prop] };
}