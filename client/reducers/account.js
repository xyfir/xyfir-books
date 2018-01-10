import * as types from 'constants/actions/account';

export default function(state, action) {
  switch (action.type) {
    case types.PURCHASE_SUBSCRIPTION:
      return Object.assign({}, state, {
        subscription: action.subscription
      });

    case types.SET_LIBRARY_SIZE_LIMIT:
      return Object.assign({}, state, {
        librarySizeLimit: action.size
      });

    case types.SET_XYANNOTATIONS_KEY:
      return Object.assign({}, state, {
        xyAnnotationsKey: action.key
      });

    default:
      return state;
  }
}