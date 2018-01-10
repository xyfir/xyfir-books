import * as types from 'constants/actions/settings';

export default function(state, action) {
  switch (action.type) {
    case types.SET_BOOK_LIST:
      return Object.assign({}, state, { bookList: action.obj });

    case types.SET_LIST_VIEW:
      return Object.assign({}, state, {
        bookList: Object.assign({}, state.bookList, {
          view: action.view
        })
      });

    case types.SET_GENERAL:
      return Object.assign({}, state, { general: action.obj });

    case types.SET_READER:
      return Object.assign({}, state, { reader: action.obj });

    default:
      return state;
  }
}