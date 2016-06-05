// Reducers
import settings from "./settings";
import account from "./account";
import books from "./books";

import {
    INITIALIZE_STATE, CHANGE_VIEW, SET_SEARCH, SET_SAVE
} from "../actions/types/";

export default function (state, action) {
        
    switch (action.type) {
        case INITIALIZE_STATE:
            return action.state;
            
        case CHANGE_VIEW:
            return Object.assign({}, state, { view: action.view });
            
        case SET_SEARCH:
            return Object.assign({}, state, { search: action.query });
            
        case SET_SAVE:
            return Object.assign({}, state, { save: action.prop });
            
        default:
            if (state === undefined) {
                return {};
            }
            else {
                return {
                    account: account(state.account, action),
                    config: settings(state.config, action),
                    books: books(state.books, action),
                    view: state.view,
                    save: ""
                };
            }
    }

}