import {
    ADD_FORMAT, DELETE_BOOKS, LOAD_BOOKS
} from "../types/books";

export function addFormat(id, format) {
    return {
        action: ADD_FORMAT, id, format
    };
}

export function deleteBooks(ids) {
    return {
        action: DELETE_BOOKS, ids
    };
}

export function loadBooks(books) {
    return {
        action: LOAD_BOOKS, books
    };
}