/**
 * @typedef {object} AnnotationSearchOrderItem
 * @property {number} item - The index of the item within the annotation set's
 * `items` array.
 * @property {number} search - The index of the search within the annotation
 * set's item's `searches` array.
 */

/**
 * @typedef {AnnotationSearchOrderItem[]} AnnotationSearchOrder
 */

/**
 * Builds the order in which an annotation set's item searches are ran against
 * the book's HTML and ensures that the longest searches are ran first.
 * @module lib/reader/annotations/build-search-order
 * @param {object[]} items - An object array of an annotation set's items.
 * @returns {AnnotationSearchOrder}
 */
export default function(items) {

  const order = [];

  items.forEach((item, itemIndex) => {
    item.searches.forEach((search, searchIndex) => {
      order.push({
        item: itemIndex, search: searchIndex, text: search.text
      });
    });
  });

  return order
    .sort((a, b) => a.text.length - b.text.length)
    .map(o => Object({ item: o.item, search: o.search }))
    .reverse();

}