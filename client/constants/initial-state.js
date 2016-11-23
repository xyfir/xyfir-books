// Constants
import * as readerThemes from "constants/reader-themes";
import { LIST_BOOKS } from "./views";

const state = {
    books: [], view: LIST_BOOKS, save: "", account: {
        subscription: 0, library: "", librarySizeLimit: 15
    }, config: {
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
            fontSize: 1, padding: 1, lineHeight: 1.4, annotationsKey: "",
            defaultHighlightMode: "none"
        })
    }, search: {
        query: "", page: 1
    }
};

export default state;