import AnnotateEPUBJS from '@xyfir/annotate-epubjs';
import escapeRegex from 'escape-string-regexp';
import EPUB from 'epubjs';

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
        const needle = new RegExp(escapeRegex(hl), 'g');

        html = AnnotateEPUBJS.wrapMatches({
          key: i,
          html,
          type: 'note',
          matches: AnnotateEPUBJS.findMatchIndexes(needle, html),
          onclick: (t, k) =>
            `!event.stopPropagation() && ` +
            `parent.postMessage({type: '${t}', key: '${k}', epubjs: true}, '*')`
        }).html;
      })
    );

  document.body.innerHTML = html;

}