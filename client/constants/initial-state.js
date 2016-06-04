// Constants
import { LIST_BOOKS } from "./views";

const state = {
    books: [], view: LIST_BOOKS, account: {
        subscription: 0, library: {
            address: "", id: ""
        }
    }, search: "", config: {
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
        reader: {
            fontSize: 1, padding: 0, backgroundColor: "#FFFFFF", color: "#000000",
			highlightColor: "#B1FB17", lineHeight: 1.4
        }
    }
};

export default state;