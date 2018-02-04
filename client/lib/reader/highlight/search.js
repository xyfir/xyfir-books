// Modules
import getMatchIndexes from 'lib/reader/matches/find-indexes';
import wrapMatches from 'lib/reader/matches/wrap';

/**
 * Highlights search matches within the current epub document.
 * @param {object} book
 * @param {string} search
 */
export default function(book, search) {

  const [{document}] = book.rendition.getContents();
  let html = document.body.innerHTML;

  const matches = getMatchIndexes(search, html);
  html = wrapMatches(matches, html, 'search', '').html;

  document.body.innerHTML = html;

}