/**
 * Cleans an input to become part of a url.
 * @param {string} input
 * @return {string}
 */
export default function(input) {

  return input
    .replace(new RegExp('[^0-9a-zA-Z ]', 'g'), '')
    .replace(new RegExp(' ', 'g'), '-')
    .substr(0, 40);

}