import * as AnnotateEPUBJS from '@xyfir/annotate-epubjs';
import escapeRegex from 'escape-string-regexp';
import EPUB from 'epubjs';

/**
 * Highlights notes within the current epub document.
 * @param {object} book
 * @param {object[]} notes
 */
export default function(book, notes) {
  const currentCfi = new EPUB.CFI(book.rendition.location.start.cfi);
  const [{ document }] = book.rendition.getContents();
  let html = document.body.innerHTML;

  notes
    // Remove notes not in current chapter
    .filter(note => currentCfi.spinePos == new EPUB.CFI(note.cfi).spinePos)
    // Highlight notes that are currently viewable
    .forEach((note, i) =>
      // Loop through the note's highlights
      note.highlights.forEach(hl => {
        const needle = new RegExp(escapeRegex(hl), 'g');

        html = AnnotateEPUBJS.insert({
          key: i,
          html,
          mode: AnnotateEPUBJS.INSERT_MODES.WRAP.ONCLICK,
          type: 'note',
          action: (k, t) =>
            `!event.stopPropagation() && ` +
            `parent.postMessage({type:'${t}',key:'${k}',xy:!0},'*')`,
          matches: AnnotateEPUBJS.findMatchIndexes(needle, html)
        }).html;
      })
    );

  document.body.innerHTML = html;
}
