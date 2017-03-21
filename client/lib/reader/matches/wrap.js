/**
 * Wraps strings within a book's HTML content with a `span` element with
 * `class` and `onclick` attributes.
 * @param {Array} matches - Returned from lib/reader/matches/find-indexes.
 * @param {string} html - The HTML book content to manipulate.
 * @param {string} type - The type of item. Also used for class name. Possible
 * values: 'note', 'anotation'
 * @param {string} key - Used in onclick to determine which item is clicked.
 */
export default function(matches, html, type, key) {

  // Offset required since we're manipulating the HTML and therefore
  // changing the length / indexes
  let offset = 0;
  
  matches.forEach(index => {
    const start = index[0] + offset;
    const end = index[1] + offset;

    html = html.substring(0, start)
      + `<span `
        + `class="${type}" `
        + `onclick="parent.epub.onClick(event, '${type}','${key}')"`
      + `>`
        + html.substring(start, end)
      + `</span>`
      + html.substring(end);

    offset += (66 + (type.length * 2) + key.length);
  });

  return html;

}