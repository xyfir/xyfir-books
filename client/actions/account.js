import * as types from 'constants/actions/account';

/** @param {number} subscription */
export function purchaseSubscription(subscription) {
  return {
    type: types.PURCHASE_SUBSCRIPTION, subscription
  };
}

/** @param {number} size */
export function setLibrarySizeLimit(size) {
  return {
    type: types.SET_LIBRARY_SIZE_LIMIT, size
  };
}

/** @param {string} key */
export function setXyAnnotationsKey(key) {
  return {
    type: types.SET_XYANNOTATIONS_KEY, key
  };
}