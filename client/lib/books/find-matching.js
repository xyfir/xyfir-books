/**
 * Find and return books that match the search query.
 * @param {object[]} books
 * @param {string} query 
 * @return {object[]}
 */
export default function(books, query) {
  
  if (query == '') return books;
  
  const fieldSearch = /\b(\w+:\w+)\b/.test(query);
  query = query.toLowerCase().split(' ');
  
  return books.filter(book => {
    const matches = [];
    
    // Search specific fields
    if (fieldSearch) {
      query.forEach(s => {
        s = s.split(':');
        
        if (s[1] === undefined) return;
        
        s[1] = s[1].replace(/_/g, ' ');
        
        if (s[0] == 'rating') {
          if (s[1] == 'unrated') {
            if (book.rating === undefined || book.rating == 0)
              matches.push(true);
            else
              matches.push(false);
          }
          else if (book.rating == s[1].split(' ')[0]) {
            matches.push(true);
          }
          else {
            matches.push(false);
          }
        }
        else if (s[0] == 'tag') {
          matches.push(
            !!book.tags.filter(tag => tag.toLowerCase() == s[1]).length
          );
        }
        else if (book[s[0]] === undefined) {
          matches.push(false);
        }
        else if (book[s[0]].toString().toLowerCase().indexOf(s[1]) > -1) {
          matches.push(true);
        }
      });
    }
    // Treat each word as its own search in both title and authors fields
    // Only match if each word has a match either in title or authors
    else {
      query.forEach(s => {
        if (book.title.toLowerCase().indexOf(s) > -1)
          matches.push(true);
        else if (book.authors.toLowerCase().indexOf(s) > -1)
          matches.push(true);
        else
          matches.push(false);
      });
    }
    
    return query.length == matches.length && matches.findIndex(m => !m) == -1;
  });
  
}