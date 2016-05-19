import {
    SET_BOOK_LIST, SET_THEME, SET_LIST_VIEW
} from "../types/settings";

export function setBookList(obj) {
    return {
        action: SET_BOOK_LIST, obj
    };
}

export function setTheme(theme) {
    return {
        action: SET_THEME, theme
    };
}

export function setListView(view) {
    return {
        action: SET_LIST_VIEW, view
    };
}