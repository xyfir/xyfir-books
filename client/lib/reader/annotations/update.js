import request from 'superagent';

// Constants
import { XYFIR_ANNOTATIONS } from 'constants/config';

/**
 * Updates the locally saved annotation sets.
 * @param {object[]} sets - An array of annotation sets
 * @param {string} key - Xyfir Annotations subscription key
 * @returns {Promise} A promise that always resolves to an array of updated
 * annotation sets, or an empty array on error.
 */
export default function(sets, key) {

  return new Promise(resolve => {
    if (!sets || !sets.length || !key || !navigator.onLine) {
      resolve([]);
      return;
    }

    request
      .get(XYFIR_ANNOTATIONS + 'annotations')
      .query({
        subscriptionKey: key, sets: JSON.stringify(
          sets.map(set => Object({ id: set.id, version: set.version }))
        )
      })
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', 'Could not update annotations', 'error');
          resolve([]);
        }
        else {
          // Check if new version has been received
          sets.forEach((set, i) => {
            if (res.body[set.id] && res.body[set.id].version != set.version) {
              // Update version / items
              Object.assign(sets[i], res.body[set.id]);
            }
          });

          resolve(sets);
        }
      });
  });

}