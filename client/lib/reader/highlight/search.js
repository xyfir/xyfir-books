import * as AnnotateEPUBJS from '@xyfir/annotate-epubjs';
import escapeRegex from 'escape-string-regexp';

/**
 * Highlights search matches within the current epub document.
 * @param {object} book
 * @param {string} search
 */
export default function(book, search) {
  const [{ document }] = book.rendition.getContents();
  const needle = new RegExp(escapeRegex(search), 'g');
  let html = document.body.innerHTML;

  html = AnnotateEPUBJS.insert({
    key: '',
    html,
    type: 'search',
    mode: AnnotateEPUBJS.INSERT_MODES.WRAP.ONCLICK,
    matches: AnnotateEPUBJS.findMatchIndexes(needle, html),
    onclick: (k, t) =>
      `!event.stopPropagation() && ` +
      `parent.postMessage({type:'${t}',key:'${k}',xy:!0},'*')`
  }).html;

  document.body.innerHTML = html;
}
