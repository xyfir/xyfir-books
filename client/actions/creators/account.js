import {
  PURCHASE_SUBSCRIPTION, SET_LIBRARY_SIZE_LIMIT, SET_XYANNOTATIONS_KEY
} from '../types/account';

export function purchaseSubscription(subscription) {
  return {
    type: PURCHASE_SUBSCRIPTION, subscription
  };
}

export function setLibrarySizeLimit(size) {
  return {
    type: SET_LIBRARY_SIZE_LIMIT, size
  };
}

export function setXyAnnotationsKey(key) {
  return {
    type: SET_XYANNOTATIONS_KEY, key
  };
}