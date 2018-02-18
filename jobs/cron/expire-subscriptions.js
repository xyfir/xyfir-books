const MySQL = require('lib/mysql');

/**
 * Reset size limit and subscription expiration for users whose subscriptions
 *  have expired.
*/
module.exports = async function() {

  const db = new MySQL;

  try {
    await db.getConnection();
    await db.query(`
      UPDATE users SET
        library_size_limit = 1, subscription = 0
      WHERE
        library_size_limit != 1 AND
        UNIX_TIMESTAMP() * 1000 > subscription
    `);
    db.release();
  }
  catch (err) {
    db.release();
    console.error('jobs/cron/expire-subscriptions', err);
  }

};