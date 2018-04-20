import request from 'superagent';

// Constants
import { XYANNOTATIONS_URL } from 'constants/config';

/**
 * Updates the locally saved annotation sets.
 * @async
 * @param {object[]} sets - An array of annotation sets
 * @param {string} key - Xyfir Annotations subscription key
 * @return {object[]} An array of updated annotation sets, or an empty array
 *  on error.
 */
export default async function(sets, key) {
  try {
    if (!sets || !sets.length || !key || !navigator.onLine) throw 'Skip';

    for (let set of sets) {
      const res = await request
        .get(`${XYANNOTATIONS_URL}/api/sets/${set.id}/download`)
        .query({
          subscriptionKey: key,
          version: set.version
        });

      // Check if new version has been received
      if (set.version != res.body.set.version) Object.assign(set, res.body.set);
    }

    return sets;
  } catch (err) {
    console.warn('lib/reader/annotations/update', err);
    return sets || [];
  }
}
