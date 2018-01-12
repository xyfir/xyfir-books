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

    const res = await request
      .get(`${XYANNOTATIONS_URL}/api/annotations`)
      .query({
        subscriptionKey: key,
        sets: JSON.stringify(sets.map(s => ({id: s.id, version: s.version})))
      });

    if (res.body.error) throw 'Received xyAnnotations error';

    // Check if new version has been received
    sets.forEach((set, i) => {
      if (res.body[set.id] && res.body[set.id].version != set.version) {
        // Update version / items
        Object.assign(sets[i], res.body[set.id]);
      }
    });

    return sets;
  }
  catch (err) {
    console.warn('lib/reader/annotations/update', err);
    return sets || [];
  }

}