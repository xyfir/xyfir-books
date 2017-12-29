import escapeRegex from 'escape-string-regexp';

// Modules
import buildSearchOrder from 'lib/reader/annotations/build-search-order';
import getMatchIndexes from 'lib/reader/matches/find-indexes';
import findMarkers from 'lib/reader/annotations/find-markers';
import wrapMatches from 'lib/reader/matches/wrap';

/**
 * @typedef {object} AnnotationSet
 * @prop {number} id
 * @prop {object[]} items
 */
/**
 * Finds and highlights an annotation set's items within the ebook's rendered
 * HTML.
 * @async
 * @param {object} book - An EPUBJS book
 * @param {AnnotationSet} set - An annotation set
 */
export default async function(book, set) {

  const [{document}] = book.rendition.getContents();
  const wordChar = /[A-Za-z0-9]/;
  const markers = await findMarkers(book, set.items);
  const order = buildSearchOrder(set.items);
  let html = document.body.innerHTML;

  // Get current chapter index to compare with chapter in markers
  const chapter = book.rendition.location.start.index;

  order.forEach(o => {
    const item = set.items[o.item];
    const search = item.searches[o.search];

    // If not regex, escape regex characters and wrap in \b
    let needle;
    if (search.regex) {
      needle = search.main;
    }
    else {
      // Add \b start/end of regex if start/end is a non-word character
      // Prevents words from being highlighted within longer words
      needle =
        (wordChar.test(search.main[0]) ? '\\b' : '') +
        escapeRegex(search.main) +
        (wordChar.test(search.main[search.main.length - 1]) ? '\\b' : '');
    }

    // Get start/end string indexes for each match
    let matches = getMatchIndexes(needle, html);

    if (search.before || search.after) {
      // Filter out invalid matches based on before|after
      matches = matches.filter(match => {
        // Get before/after marker objects
        // Each object contains chapter index and string index
        // of where marker occured in book
        const before = markers[`${item.id}-${o.search}-1`];
        const after  = markers[`${item.id}-${o.search}-2`];

        // In book's content, where a search has before/after
        // :before: ... :main: ... :after:

        if (search.before) {
          // Marker could not be found
          if (before === undefined)
            return false;
          // User has yet to reach chapter where marker occurs
          else if (before.chapter > chapter)
            return false;
          // User has yet to reach index in chapter where marker occurs
          else if (before.chapter == chapter && before.index > match[0])
            return false;
        }

        if (search.after) {
          // Marker could not be found
          if (after === undefined)
            return false;
          // User has passed chapter where marker occurs
          else if (after.chapter < chapter)
            return false;
          // User has passed index within chapter where marker occurs
          else if (after.chapter == chapter && after.index < match[0])
            return false;
        }

        return true;
      });
    }

    const wrapped = wrapMatches(
      matches, html, 'annotation', set.id + '-' + item.id
    );

    html = wrapped.html;

    // Update string indexes within markers{}
    Object
      .keys(markers)
      .filter(marker => marker.chapter != chapter)
      .map(marker => {
        // Increase marker's string index by the wrapper's length every time
        // an annotation was inserted before the marker
        wrapped.inserts.map(insertIndex => {
          if (markers[marker].index > insertIndex)
            markers[marker].index += wrapped.wrapLength;
        });
      });
  });

  document.body.innerHTML = html;

}