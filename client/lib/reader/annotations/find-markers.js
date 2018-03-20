import escapeRegex from 'escape-string-regexp';

/**
 * @typedef {object} AnnotationMarker
 * @prop {number} chapter - Index of the chapter that the marker exists in.
 * @prop {number} index - Index of the character in the chapter HTML string
 * that the marker exists at.
 */
/**
 * @typedef {object} AnnotationMarkers
 * @prop {AnnotationMarker} [${itemId}-${searchIndex}-${type}] - `itemId`
 * is the id of the item in the annotation set. `searchIndex` is the index of
 * the search within the item in the set. `type` is 1 for a 'before' marker and
 * 2 for an 'after' marker.
 */
/**
 * Finds instances of 'before' and 'after' searches within an annotation set's
 * item's searches.
 * @async
 * @param {object} book - EPUBJS book
 * @param {object[]} items - Annotation set items
 * @return {AnnotationMarkers}
 */
export default async function(book, items) {

  const markers = {};

  // Used to render each chapter
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Loop through all files in book
  for (let spineItem of book.spine.items) {
    // Ignore non-html files
    if (!/html$/.test(spineItem.href.split('.').slice(-1)[0])) continue;

    /** @type {string} - The file's HTML */
    let file =
      book.archive.zip.files[spineItem.href] ||
      book.archive.zip.files[`OEBPS/${spineItem.href}`];

    if (!file) continue;

    file = await file.async('string');

    // Convert file content into html string
    iframe.contentDocument.documentElement.innerHTML = file,
    file = iframe.contentDocument.body.innerHTML;

    // Loop through all items in annotation set
    items.forEach(item =>
      // Loop through all search queries in item
      item.searches.forEach((search, searchIndex) => {
        // If search query is global, it doesn't have a before or after
        if (!search.before && !search.after) return;

        if (search.before) {
          const regex = new RegExp(
            search.regex
              ? search.before
              : escapeRegex(search.before)
          );
          const match = regex.exec(file);

          if (match) {
            markers[`${item.id}-${searchIndex}-1`] = {
              chapter: spineItem.index, index: match.index
            };
          };
        }

        if (search.after) {
          const regex = new RegExp(
            search.regex
              ? search.after
              : escapeRegex(search.after)
          );
          const match = regex.exec(file);

          if (match) {
            markers[`${item.id}-${searchIndex}-2`] = {
              chapter: spineItem.index, index: match.index
            };
          };
        }
      })
    );
  }

  iframe.remove();

  return markers;

}