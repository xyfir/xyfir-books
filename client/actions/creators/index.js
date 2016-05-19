import {
    CHANGE_VIEW, SET_SEARCH
} from "../types/";

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