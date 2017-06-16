/**
 * Unwrap elements with the provided class name.
 * @param {string} className
 */
export default function(className) {

  epub.renderer.doc.querySelectorAll('.' + className).forEach(el => {
    const parent = el.parentElement;

    parent.insertBefore(el.firstChild, el);
    el.remove();
  });

}