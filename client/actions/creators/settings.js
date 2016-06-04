import {
    SET_BOOK_LIST, SET_THEME, SET_LIST_VIEW, SET_READER
} from "../types/settings";

export function setBookList(obj) {
    return {
        type: SET_BOOK_LIST, obj
    };
}

export function setTheme(theme) {
    return {
        type: SET_THEME, theme
    };
}

export function setListView(view) {
    return {
        type: SET_LIST_VIEW, view
    };
}

export function setReader(obj) {
    return {
        type: SET_READER, obj
    };
}