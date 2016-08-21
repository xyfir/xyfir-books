// Constants
import { URL, LIBRARY_URL } from "constants/config";

// Action creators
import { loadBooks } from "actions/creators/books";
import { save } from "actions/creators/index";

// Modules
import request from "lib/request/index";

function mergeAnnotations(books, fn) {
    
    localforage.getItem("books").then(storedBooks => {
        if (storedBooks) {
            storedBooks.forEach(sb => {
                if (sb.annotations && sb.annotations.length) {
                    books.forEach((book, i) => {
                        if (sb.id == book.id) {
                            books[i].annotations = sb.annotations;
                        }
                    });
                }
            });
        }

        fn(books);
    }).catch(err => fn(books));

}

export default function (library, dispatch, fn) {
    
    // Get from Libyq DB
    request({url: URL + "api/books", success: (books1) => {
        if (books1.books.length > 0) {
            const url = LIBRARY_URL + library + "/books";
            
            // Get from library manager server
            request({url, success: (books2) => {
                const books = books1.books.map(b1 => {
                    let b2 = books2.books.find(b2 => b1.id == b2.id);
                    
                    Object.assign(b2, b1);
                    
                    b2.versions = {
                        metadata: b2.version_metadata,
                        cover: b2.version_cover
                    };
                    delete b2.version_metadata; delete b2.version_cover;
                    
                    return b2;
                }).filter(b => b.title !== undefined);
                
                books1 = null, books2 = null;
                
                // Merge annotations from books saved to local storage
                mergeAnnotations(books, (books) => {
                    if (fn === undefined) {
                        // Load books into state and save books[] to local storage
                        dispatch(loadBooks(books));
                        dispatch(save("books"));
                    }
                    else {
                        fn(books);
                    }
                });
            }});
        }
    }});
    
}