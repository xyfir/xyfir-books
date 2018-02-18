import * as types from 'constants/actions/account';

/** @param {string} key */
export function setXyAnnotationsKey(key) {
  return {
    type: types.SET_XYANNOTATIONS_KEY, key
  };
}