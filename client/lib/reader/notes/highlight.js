// Modules
import getMatchIndexes from 'lib/reader/matches/find-indexes';
import wrapMatches from 'lib/reader/matches/wrap';

/**
 * Highlights notes within the current epub document.
 * @param {object[]} notes 
 */
export default function(notes) {

  const currentCfi = new EPUBJS.EpubCFI(epub.getCurrentLocationCfi());
  let html = epub.renderer.doc.body.innerHTML;
  
  notes
    // Remove notes not in current chapter
    .filter(note =>
      currentCfi.spinePos == (new EPUBJS.EpubCFI(note.cfi)).spinePos
    )
    // Highlight notes currently viewable
    .forEach((note, i) =>
      // Loop through the note's highlights
      note.highlights.forEach(hl => {
        const matches = getMatchIndexes(hl, html);
        html = wrapMatches(matches, html, 'note', i).html;
      })
    );

  epub.renderer.doc.body.innerHTML = html;

}