import {
    SET_BOOK_LIST, SET_THEME, SET_LIST_VIEW, SET_READER
} from "../actions/types/settings";

export default function(state, action) {
    switch (action.type) {
        case SET_BOOK_LIST:
            return Object.assign({}, state, {
                bookList: action.obj
            });
            
        case SET_LIST_VIEW:
            return Object.assign({}, state, {
                bookList: Object.assign({}, state.bookList, {
                    view: action.view
                })
            });
            
        case SET_THEME:
            return Object.assign({}, state, {
                general: Object.assign({}, state.general, {
                    theme: action.theme
                })
            })
            
        case SET_READER:
            return Object.assign({}, state, {
                reader: action.obj
            });
            
        default:
            return state;
    }
}