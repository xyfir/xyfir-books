import * as types from 'constants/actions/account';

export default function(state, action) {
  switch (action.type) {
    case types.SET_XYANNOTATIONS_KEY:
      return Object.assign({}, state, {
        xyAnnotationsKey: action.key
      });

    default:
      return state;
  }
}