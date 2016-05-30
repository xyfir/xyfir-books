import {
    ADD_FORMAT, DELETE_BOOKS, LOAD_BOOKS, DELETE_FORMAT,
    INCREMENT_VERSION, UPDATE_BOOK
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

export function deleteFormat(id, format) {
    return {
        type: DELETE_FORMAT, id, format
    };
}

export function incrementVersion(id, prop) {
    return {
        type: INCREMENT_VERSION, id, prop
    };
}

export function updateBook(id, obj) {
    return {
        type: INCREMENT_VERSION, id, obj
    };
}