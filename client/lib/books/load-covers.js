import request from 'superagent';

// Constants
import { LIBRARY } from 'constants/config';

/**
 * Deletes outdated book covers.
 * @param {object[]} books 
 */
function purgeCovers(books) {

  const lastPurge = +localStorage['last_cover_purge'] || 0;
  
  // Only purge covers at most once a day
  if (!books.length || (Date.now() - lastPurge) < 86400000) return;
  
  setTimeout(() => localforage.keys().then(keys => {
    // Filter out non-cover keys
    keys = keys.filter(k => k.indexOf('cover-') == 0);
    
    keys.forEach(k => {
      // [ 'cover', id, version ]
      const t = k.split('-');
      
      const book = books.find(b => t[1] == b.id);
      
      // Delete if book id no longer exists in books
      if (book === undefined)
        localforage.removeItem(k);
      // Delete if book has a higher version number
      else if (book.versions.cover > t[2])
        localforage.removeItem(k);
    });

    localStorage['last_cover_purge'] = Date.now();
  }), 30 * 1000);
  
}

/**
 * Downloads a book cover, sets the element's source, and saves the image.
 * @param {object} book
 * @param {string} library 
 */
function loadFromApi(book, library) {
  
  if (!navigator.onLine) return;
  
  request
    .get(`${LIBRARY}files/${library}/${book.cover}`)
    .responseType('blob')
    .end((err, res) => {
      const cover = document.getElementById(`cover-${book.id}`);

      // Element may no longer exist
      if (cover != null) cover.src = URL.createObjectURL(res.body);

      localforage.setItem(
        `cover-${book.id}-${book.versions.cover}`, res.body
      );
    });

}

/**
 * Loads covers for img.cover elements on the page.
 * @param {object[]} books
 * @param {string} library 
 */
function loadCovers(books, library) {
  
  document.querySelectorAll('img.cover').forEach(img => {
    const id = img.id.split('-')[1];
    const book = books.find(b => id == b.id);
    
    // Determine if we have book's latest cover stored
    localforage.getItem(`cover-${id}-${book.versions.cover}`)
      .then(cover => {
        // Cover not saved to localstorage, pull from API
        if (cover == null)
          loadFromApi(book, library);
        // Set image source
        else
          document.getElementById(img.id).src = URL.createObjectURL(cover);
      })
      .catch(err => loadFromApi(book, library));
  });
  
  purgeCovers(books);
  
}

export default loadCovers;