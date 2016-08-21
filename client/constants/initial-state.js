// Constants
import * as readerThemes from "constants/reader-themes";
import { LIST_BOOKS } from "./views";

const state = {
    books: [], view: LIST_BOOKS, account: {
        subscription: 0, library: ""
    }, search: "", save: "", config: {
        general: {
            theme: "light"
        },
        bookList: {
            view: "compact", table: {
                columns: [
                    "title", "authors", "series", "added", "rating"
                ], defaultSort: {
                    column: "title", asc: true
                }
            }
        },
        reader: Object.assign({}, readerThemes.LIGHT, {
            fontSize: 1, padding: 0, lineHeight: 1.4, annotationsKey: ""
        })
    }
};

export default state;