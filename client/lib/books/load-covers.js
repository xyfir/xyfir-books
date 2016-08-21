// Modules
import request from "lib/request/index";

// Constants
import { LIBRARY_URL } from "constants/config";

function cleanUp(books) {
    
    if (!books.length) return;
    
    setTimeout(() => localforage.keys().then(keys => {
        // Filter out non-cover keys
        keys = keys.filter(k => k.indexOf("cover-") == 0);
        
        keys.forEach(k => {
            // [ "cover", id, version ]
            const t = k.split('-');
            
            const book = books.find(b => t[1] == b.id);
            
            // Delete if book id no longer exists in books
            if (book === undefined) {
                localforage.removeItem(k);
            }
            // Delete if book has a higher version number
            else if (book.versions.cover > t[2]) {
                localforage.removeItem(k);
            }
        });
    }), 30 * 1000);
    
}

function loadFromApi(book, library) {
    
    if (navigator.onLine) {
        let xhr = new XMLHttpRequest();
        
        xhr.responseType = "blob";
        
        // Receive file blob from server
        xhr.onload = function() {
            let reader = new FileReader();
            
            // Set image.src and save image to local storage
            reader.onloadend = () => {
                document.getElementById(`cover-${book.id}`).src = reader.result;
                
                localforage.setItem(`cover-${book.id}-${book.versions.cover}`, reader.result);
            }
            
            // Convert blob to base64 data url
            reader.readAsDataURL(xhr.response);
        };

        // Build url using state.account.library / book.cover path
        const url = LIBRARY_URL + library + "/files/"
            + book.cover.split('/').slice(-3).join('/');

        xhr.open("GET", url);
        xhr.send();
    }

}

function loadCovers(books, library) {
    
    [].forEach.call(document.querySelectorAll("img.cover"), img => {
        const id = img.id.split('-')[1];
        const book = books.find(b => id == b.id);
        
        // Determine if we have book's latest cover stored
        localforage.getItem(`cover-${id}-${book.versions.cover}`).then(cover => {
            if (cover == null) {
                loadFromApi(book, library);
            }
            else {
                document.getElementById(img.id).src = cover;
            }
        }).catch(err => loadFromApi(book, library));
    });
    
    cleanUp(books);
    
}

export default loadCovers;