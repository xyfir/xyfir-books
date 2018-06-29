/**
 * Convert hex color string to rgba() string.
 * @param {string} hex
 * @param {number} [a=1]
 */
export default function(hex, a = 1) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(
    m[3],
    16
  )}, ${a})`;
}
