/**
 * Listen for clicks and convert them to actions based on the location of the
 * click on the page.
 * @param {HTMLElement} el - The element to add event listeners to.
 * @param {object} book - EPUBJS book
 * @param {function} fn - The listener function.
 */
export default function(el, book, fn) {
  el.addEventListener(
    'click',
    event => {
      if (event.ignore) return;
      event.ignore = true;

      const [{ document }] = book.rendition.getContents();

      // User selected text
      if (!!document.getSelection().toString()) return;

      // Get book iframe window's size
      const wX = window.bookView.clientWidth;
      const wY = window.bookView.clientHeight;

      // Get click location
      const cX = event.clientX - (book.rendition.manager.scrollLeft || 0);
      const cY = event.clientY;

      // Click was in left 10% of page
      if (cX < wX * 0.1) fn('previous page');
      // Click was in right 10% of page
      else if (cX > wX - wX * 0.1) fn('next page');
      // Click was in top 5% of page
      else if (cY < wY * 0.05) fn('show book info');
      // Click was in bottom 5% of page
      else if (cY > wY - wY * 0.05) fn('cycle highlights');
      // Click was somewhere in middle
      else fn('toggle navbar');
    },
    false
  );
}
