import {
    CHANGE_VIEW, SET_SEARCH, SET_SAVE
} from "../types/index";

export function changeView(view) {
    return {
        type: CHANGE_VIEW, view
    };
}

export function setSearch(query) {
    return {
        type: SET_SEARCH, query
    };
}

export function save(prop) {
    return {
        type: SET_SAVE, prop
    };
}