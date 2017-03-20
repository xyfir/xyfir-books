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
 * @module client/lib/reader/annotations/find-markers
 * @param {object[]} items 
 * @returns {AnnotationMarker}
 */
export default function (items) {
  
  const markers = {};

  // Grab book files
  const files = epub.zip.zip.files;
  const zip = new JSZip();

  // Loop through all files in book
  Object.keys(files).forEach((file, chapter) => {
    if (file.split('.')[1] != 'html') return;
    
    // Convert file content into html string
    file = zip.utf8decode(files[file]._data.getContent());

    // Loop through all items in annotation set
    items.forEach(item => {
      // Loop through all search queries in item
      item.searches.forEach((search, searchIndex) => {
        // If search query is global, it doesn't have a before or after range
        if (!search.range.global) {
          if (search.range.before) {
            const index = file.indexOf(f.range.before);

            if (index > -1) {
              markers[`${item.id}-${searchIndex}-1`] = {
                chapter, index
              };
            };
          }
          
          if (search.range.after) {
            const index = file.indexOf(search.range.after);

            if (index > -1) {
              markers[`${item.id}-${searchIndex}-2`] = {
                chapter, index
              };
            };
          }
        }
      });
    });
  });

  return markers;

}