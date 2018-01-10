// Reducers
import settings from 'reducers/settings';
import account from 'reducers/account';
import books from 'reducers/books';

import * as types from 'constants/actions/app';

export default function (state, action) {

  switch (action.type) {
    case types.INITIALIZE_STATE:
      return action.state;

    case types.SET_STATE:
      return Object.assign({}, state, action.state);

    case types.SET_VIEW:
      return Object.assign({}, state, { view: action.view });

    case types.SET_SEARCH:
      return Object.assign({}, state, {
        search: Object.assign({}, state.search, {
          query: action.query
        })
      });

    case types.SET_PAGE:
      return Object.assign({}, state, {
        search: Object.assign({}, state.search, {
          page: action.page
        })
      });

    case types.SET_SAVE:
      return Object.assign({}, state, { save: action.prop });

    default:
      if (state === undefined) {
        return {};
      }
      else {
        return {
          account: account(state.account, action),
          config: settings(state.config, action),
          search: state.search,
          books: books(state.books, action),
          view: state.view,
          save: state.save
        };
      }
  }

}