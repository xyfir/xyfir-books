import buildAnnotationSearchOrder from 'lib/reader/annotations/build-search-order';
import findAnnotationMarkers from 'lib/reader/annotations/find-markers';
import escapeRegex from 'escape-string-regexp';

// Modules
import getMatchIndexes from 'lib/reader/matches/find-indexes';
import wrapMatches from 'lib/reader/matches/wrap';

/**
 * Finds and highlights an annotation set's items within the ebook's rendered
 * HTML.
 * @param {object} set - An annotation set.
 */
export default function(set) {

  const wordChar = /[A-Za-z0-9]/;
  const markers = findAnnotationMarkers(set.items);
  const order = buildAnnotationSearchOrder(set.items);
  let html = epub.renderer.doc.body.innerHTML;

  order.forEach(o => {
    const item = set.items[o.item];
    const search = item.searches[o.search];

    // If not regex, escape regex characters and wrap in \b
    let needle;
    if (search.regex) {
      needle = search.text;
    }
    else {
      // Add \b start/end of regex if start/end is a non-word character
      // Prevents words from being highlighted within longer words
      needle =
        (wordChar.test(search.text[0]) ? '\\b' : '') +
        escapeRegex(search.text) +
        (wordChar.test(search.text[search.text.length - 1]) ? '\\b' : '');
    }

    // Get start/end string indexes for each match
    let matches = getMatchIndexes(needle, html);

    if (!search.range.global) {
      // Get current chapter index to compare with chapter in markers
      let chapter = 0;
      Object.keys(epub.zip.zip.files).forEach((file, i) => {
        if (file == epub.currentChapter.href) chapter = i;
      });

      // Filter out invalid matches based on range.before|after
      matches = matches.filter(match => {
        // Get before/after marker objects
        // Each object contains chapter index and string index
        // of where marker occured in book
        const before = markers[
          `${item.id}-${o.search}-1`
        ];
        const after  = markers[
          `${item.id}-${o.search}-2`
        ];

        if (search.range.before) {
          // Marker could not be found
          if (before === undefined)
            return false;
          // User has passed chapter where marker occurs
          else if (before.chapter < chapter)
            return false;
          // User has passed index within chapter where marker occurs
          else if (before.chapter == chapter && before.index < match[0])
            return false;
        }

        if (search.range.after) {
          if (after === undefined)
            return false;
          // User has yet to reach chapter where marker occurs
          else if (after.chapter > chapter)
            return false;
          // User has yet to reach index in chapter where marker occurs
          else if (after.chapter == chapter && after.index > match[0])
            return false;
        }

        return true;
      });
    }

    html = wrapMatches(
      matches, html, 'annotation', set.id + '-' + item.id
    );
  });

  epub.renderer.doc.body.innerHTML = html;

}