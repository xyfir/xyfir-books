export default function(books, query) {
    
    if (query == '') return books;
    
    const search = query.split(' ');
    
    return books.filter(book => {
        let match = false;
        
        search.forEach(s => {
            // Search a specific field
            if (s.indexOf(':') > -1) {
                s = s.split(':');
                
                if (book[s[0]] === undefined || s[1] === undefined)
                    return;
                else if (('' + book[s[0]]).toLowerCase().indexOf(s[1].replace(new RegExp('_', 'g'), ' ')) > -1)
                    match = true;
            }
            // Search all fields
            else {
                for (const prop in book) {
                    if (typeof book[prop] != "object" && ('' + book[prop]).toLowerCase().indexOf(s) > -1) {
                        match = true;
                        break;
                    }
                }
            }
        });
        
        return match;
    });
    
}