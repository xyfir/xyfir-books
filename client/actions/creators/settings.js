import {
    UPDATE_BOOK_LIST, SET_THEME
} from "../types/settings";

export function updateBookList(obj) {
    return {
        action: UPDATE_BOOK_LIST, obj
    };
}

export function setTheme(theme) {
    return {
        action: SET_THEME, theme
    };
}