// Constants
import { URL } from "../../constants/config";

// Action creators
import { loadBooks } from "../../actions/creators/books";

// Modules
import request from "../request/";

export default function (library, dispatch) {
    
    // Get from Libyq DB
    request({url: URL + "api/books", success: (books1) => {
        if (books1.books.length > 0) {
            const url = library.address + "library/" + library.id + "/books";
            
            // Get from library manager server
            request({url, success: (books2) => {
                const books = books1.books.map(b1 => {
                    let b2 = books2.books.find(b2 => b1.id == b2.id);
                    
                    b2.versions = {
                        metadata: b1.version_metadata,
                        cover: b1.version_cover
                    };
                    b2.percent_complete = b1.percent_complete;
                    b2.word_count = b1.word_count;
                    b2.last_read = b1.last_read;
                    
                    return b2;
                }).filter(b => b.title !== undefined);
                
                books1 = null, books2 = null;
                
                dispatch(loadBooks(books));
                
                localforage.setItem("books", books);
            }});
        }
    }});
    
}