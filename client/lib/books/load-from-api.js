// Constants
import { URL } from "../../constants/config";

// Action creators
import { loadBooks } from "../../actions/creators/books";

export default function (library, dispatch) {
    
    // Get from Libyq DB
    ajax({url: URL + "api/books", success: (books1) => {
        if (books1.books.length > 0) {
            const url = library.address + "library/" + library.id + "/books";
            
            // Get from library manager server
            ajax({url, success: (books2) => {
                dispatch(loadBooks(books1.map(b1 => {
                    // b1 becomes b2 with versions object property
                    books2.forEach(b2 => {
                        if (b1.id == b2.id) {
                            b1 = Object.assign({}, b2, { versions: {
                                metadata: b1.versionMetadata, cover: b1.versionCover
                            }});
                        }
                    });
                    
                    return b1;
                }).filter(b => b.title !== undefined)));
            }});
        }
    }});
    
}