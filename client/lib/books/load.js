import request from 'superagent';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

/**
 * Loads a book's EPUB file from local storage or from the remote library.
 * @async
 * @param {object} App
 * @param {object} book
 * @throws {string}
 * @return {Blob}
 */
export default async function(App, book) {
  try {
    // Build url to .epub file to read
    let url = `${XYLIBRARY_URL}/files/${App.state.account.library}/`;
    let hasEpub = false;

    book.formats.forEach(format => {
      if (format.split('.').slice(-1)[0] == 'epub') {
        (hasEpub = true), (url += format);
      }
    });

    // We can only read epub files
    if (!hasEpub) throw 'EPUB file missing';

    let blob;

    // Attempt to load epub file, either locally or remotely
    try {
      blob = await localforage.getItem(`epub-${book.id}`);
      if (!blob) throw 'Missing file';
    } catch (err) {
      if (!navigator.onLine) throw 'Book is not downloaded for offline use';

      try {
        const { body } = await request.get(url).responseType('blob');
        blob = body;

        // Save file, no matter if successful
        localforage
          .setItem(`epub-${book.id}`, blob)
          .then(() => 1)
          .catch(() => 1);
      } catch (err) {
        throw 'Could not download ebook file';
      }
    }

    return blob;
  } catch (err) {
    App._alert(err);
    throw err;
  }
}
