export default function(books, query) {
    
    if (query == '') return books;
    
    const search = query.indexOf(':') > -1 ? query.split(' ') : query;
    
    return books.filter(book => {
        let match = false;
        
        // Search specific fields
        if (Array.isArray(search)) {
            search.forEach(s => {
                s = s.split(':');
                
                if (s[1] === undefined) return;
                
                s[1] = s[1].replace(new RegExp('_', 'g'), ' ');
                
                if (s[0] == "rating") {
                    if (s[1] == "unrated") {
                        if (book.rating === undefined || book.rating == 0)
                            match = true;
                        else
                            match = false;
                    }
                    else if (book.rating == s[1].split(' ')[0]) {
                        match = true;
                    }
                    else {
                        match = false;
                    }
                }
                else if (s[0] == "tag") {
                    match = !!book.tags.filter(tag => {
                        return tag.toLowerCase() == s[1];
                    }).length;
                }
                else if (book[s[0]] === undefined) {
                    match = false;
                }
                else if (book[s[0]].toString().toLowerCase().indexOf(s[1]) > -1) {
                    match = true;
                }
            });
        }
        // Search title / authors
        else {
            if (book.title.toLowerCase().indexOf(search) > -1)
                match = true;
            else if (book.authors.toLowerCase().indexOf(search) > -1)
                match = true;
        }
        
        return match;
    });
    
}