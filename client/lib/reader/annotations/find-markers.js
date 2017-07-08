import escapeRegex from 'escape-string-regexp';

/**
 * @typedef {object} AnnotationMarker
 * @property {number} chapter - Index of the chapter that the marker exists in.
 * @property {number} index - Index of the character in the chapter HTML string
 * that the marker exists at.
 */

/**
 * @typedef {object} AnnotationMarkers
 * @property {AnnotationMarker} [${itemId}-${searchIndex}-${type}] - `itemId`
 * is the id of the item in the annotation set. `searchIndex` is the index of
 * the search within the item in the set. `type` is 1 for a 'before' marker and
 * 2 for an 'after' marker.
 */

/**
 * Finds instances of 'before' and 'after' searches within an annotation set's
 * item's searches. 
 * @param {object[]} items 
 * @returns {AnnotationMarkers}
 */
export default function (items) {
  
  const markers = {};

  // Grab book files
  const files = epub.zip.zip.files;
  const zip = new JSZip();

  // Used to render each chapter
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Loop through all files in book
  Object.keys(files).forEach((file, chapter) => {
    if (file.split('.').slice(-1)[0] != 'html') return;
    
    // Convert file content into html string
    iframe.contentDocument.documentElement.innerHTML =
      zip.utf8decode(files[file]._data.getContent()),
    file = iframe.contentDocument.body.innerHTML;

    // Loop through all items in annotation set
    items.forEach(item =>
      // Loop through all search queries in item
      item.searches.forEach((search, searchIndex) => {
        // If search query is global, it doesn't have a before or after range
        if (search.range.global) return;

        if (search.range.before) {
          const regex = new RegExp(
            search.regex
              ? search.range.before
              : escapeRegex(search.range.before)
          );
          const match = regex.exec(file);

          if (match) {
            markers[`${item.id}-${searchIndex}-1`] = {
              chapter, index: match.index
            };
          };
        }
        
        if (search.range.after) {
          const regex = new RegExp(
            search.regex
              ? search.range.after
              : escapeRegex(search.range.after)
          );
          const match = regex.exec(file);

          if (match) {
            markers[`${item.id}-${searchIndex}-2`] = {
              chapter, index: match.index
            };
          };
        }
      })
    );
  });

  iframe.remove();

  return markers;

}