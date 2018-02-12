const sendEmail = require('lib/send-email')
const request = require('superagent');
const config = require('config');
const MySQL = require('lib/mysql');

/*
  Delete libraries that have been over size limit for a week
  Notify inactive users that their library will be deleted
*/
module.exports = async function() {

  const db = new MySQL;

  try {
    await db.getConnection();

    // Load users who have been inactive for 3+ months
    let users = await db.query(`
      SELECT user_id, email, library_id
      FROM users
      WHERE
        library_wiped = 0 AND
        UNIX_TIMESTAMP() * 1000 > subscription AND
        DATE_SUB(NOW(), INTERVAL 90 DAY) > last_active
    `);

    // Wipe libraries
    for (let user of users) {
      await request.delete(
        `${config.addresses.library}libraries/${user.library_id}`
      );
      await db.query(
        'UPDATE users SET library_wiped = 1 WHERE user_id = ?', [user.user_id]
      );
    }

    // Load users who have been inactive for almost 3 months
    users = await db.query(`
      SELECT user_id, email, library_id
      FROM users
      WHERE
        library_wiped = 0 AND
        UNIX_TIMESTAMP() * 1000 > subscription AND
        DATE_SUB(NOW(), INTERVAL 85 DAY) > last_active
    `);

    // Notify users
    for (let user of users) {
      sendEmail(
        user.email,
        'Xyfir Books - Your Library Will Be Deleted',
        `You have not logged into your xyBooks account in almost 3 months!\n\n` +
        `xyBooks automatically deletes libraries that have been inactive for 90 days. You can prevent your library from being deleted by logging into your account to show you're still active. If you have been using xyBooks only in offline mode, take a second to login online so that your books won't be removed!\n\n` +
        `You can prevent your library from being deleting after long periods of online inactivity by purchasing a Premium subscription.`
      );
    }

    db.release();
  }
  catch (err) {
    db.release();
    console.error('jobs/cron/wipe-inactive-libraries', err);
  }

};