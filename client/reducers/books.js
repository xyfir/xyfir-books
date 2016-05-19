import {
    LOAD_BOOKS, DELETE_BOOKS, ADD_FORMAT
} from "../actions/types/books";

export default function(state, action) {
    switch (action.type) {
        case LOAD_BOOKS:
            return action.books;
            
        case DELETE_BOOKS:
            return state.books.filter(book => action.ids.indexOf(book.id) == -1);
            
        case ADD_FORMAT:
            return (() => {
                let temp = Object.assign({}, state);
                
                temp.forEach((book, i) => {
                    if (action.id == book.id && book.formats.length > 0) {
                        // Add a new format based on already existing file name
                        let format = book.formats[0].split('.');
                        format[1] = action.format;
                        
                        temp[i].formats.push(format.join('.'));
                    }
                });
                
                return temp;
            }).call();
            
        default:
            return state;
    }
}