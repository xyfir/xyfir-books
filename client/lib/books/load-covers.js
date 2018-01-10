import request from 'superagent';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

/**
 * Deletes outdated book covers.
 * @param {object[]} books
 */
function purgeCovers(books) {

  const lastPurge = +localStorage.lastCoverPurge || 0;
  delete localStorage.last_cover_purge;

  // Only purge covers at most once a day
  if (!books.length || (Date.now() - lastPurge) < 86400000) return;

  setTimeout(() => localforage.keys().then(keys => {
    keys
      // Filter out non-cover keys
      .filter(k => k.indexOf('cover-') == 0)
      .forEach(k => {
        const id = k.split('-')[1];
        const book = books.find(b => id == b.id);

        // Delete if book id no longer exists in books
        if (!book)
          localforage.removeItem(k);
        // Remove covers with old key format
        // ** Remove this after next published update
        else if (/^cover-\d+-\d+$/.test(k))
          localforage.removeItem(k);
      });

    localStorage.lastCoverPurge = Date.now();
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
    .get(`${XYLIBRARY_URL}/files/${library}/${book.cover}`)
    .responseType('blob')
    .end((err, res) => {
      const cover = document.getElementById(`cover-${book.id}`);

      // Element may no longer exist
      if (cover != null) cover.src = URL.createObjectURL(res.body);

      localforage.setItem(`cover-${book.id}`, res.body);
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
    localforage.getItem(`cover-${id}`)
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