import EPUB from 'epubjs';

// Modules
import getMatchIndexes from 'lib/reader/matches/find-indexes';
import wrapMatches from 'lib/reader/matches/wrap';

/**
 * Highlights notes within the current epub document.
 * @param {object} book
 * @param {object[]} notes
 */
export default function(book, notes) {

  const currentCfi = new EPUB.CFI(book.rendition.location.start.cfi);
  const [{document}] = book.rendition.getContents();
  let html = document.body.innerHTML;

  notes
    // Remove notes not in current chapter
    .filter(note =>
      currentCfi.spinePos == (new EPUB.CFI(note.cfi)).spinePos
    )
    // Highlight notes that are currently viewable
    .forEach((note, i) =>
      // Loop through the note's highlights
      note.highlights.forEach(hl => {
        const matches = getMatchIndexes(hl, html);
        html = wrapMatches(matches, html, 'note', i).html;
      })
    );

  document.body.innerHTML = html;

}