import {
    ADD_FORMAT, DELETE_BOOKS, LOAD_BOOKS
} from "../types/books";

export function addFormat(id, format) {
    return {
        type: ADD_FORMAT, id, format
    };
}

export function deleteBooks(ids) {
    return {
        type: DELETE_BOOKS, ids
    };
}

export function loadBooks(books) {
    return {
        type: LOAD_BOOKS, books
    };
}