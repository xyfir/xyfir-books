import {
  PURCHASE_SUBSCRIPTION, SET_LIBRARY_SIZE_LIMIT, SET_XYANNOTATIONS_KEY
} from 'actions/types/account';

export default function(state, action) {
  switch (action.type) {
    case PURCHASE_SUBSCRIPTION:
      return Object.assign({}, state, {
        subscription: action.subscription
      });

    case SET_LIBRARY_SIZE_LIMIT:
      return Object.assign({}, state, {
        librarySizeLimit: action.size
      });
    
    case SET_XYANNOTATIONS_KEY:
      return Object.assign({}, state, {
        xyAnnotationsKey: action.key
      });
      
    default:
      return state;
  }
}