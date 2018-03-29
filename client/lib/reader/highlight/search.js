import AnnotateEPUBJS from '@xyfir/annotate-epubjs';
import escapeRegex from 'escape-string-regexp';

/**
 * Highlights search matches within the current epub document.
 * @param {object} book
 * @param {string} search
 */
export default function(book, search) {

  const [{document}] = book.rendition.getContents();
  const needle = new RegExp(escapeRegex(search), 'g');
  let html = document.body.innerHTML;

  html = AnnotateEPUBJS.wrapMatches({
    key: '',
    html,
    type: 'search',
    matches: AnnotateEPUBJS.findMatchIndexes(needle, html),
    onclick: (t, k) =>
      `!event.stopPropagation() && ` +
      `parent.postMessage({type: '${t}', key: '${k}', epubjs: true}, '*')`
  }).html;

  document.body.innerHTML = html;

}