/**
 * Opens `url` in InAppBrowser if in a Cordova environment and via
 *  `window.open` if in a normal browser.
 * @param {string} url
 * @return {Window}
 */
export default function(url) {
  if (window.cordova)
    return window.cordova.InAppBrowser.open(encodeURI(url), '_blank');
  else
    return window.open(url);
}