const sendEmail = require('lib/send-email');
const request = require('superagent');
const config = require('config');
const mysql = require('lib/mysql');

/*
  Get size of all libraries
  Notify owners of libraries over size limit
  Delete libraries that have been over size limit for a week
*/
module.exports = async function() {
  const db = new mysql();

  try {
    await db.getConnection();
    const rows = await db.query(`
      SELECT
        user_id, email, library_id, library_size_limit, library_delete
      FROM users
      WHERE library_wiped = 0
    `);

    if (!rows.length) throw 'No libraries to handle';

    for (let row of rows) {
      let res = await request.get(
        config.addresses.library + 'libraries/' + row.library_id
      );

      if (res.body.error) continue;

      // Library is at or over limit
      if (res.body.size / 1000000000 >= row.library_size_limit) {
        // Library has been over limit for 7+ days
        if (Date.now() >= new Date(row.library_delete).getTime())
          row.deleteLibrary = true;
        // Notify user that they're over limit
        else row.notify = true;
      }
      // Library is under limit
      else {
        row.ok = true;
      }

      if (row.ok) {
        // Remove library's deletion date
        if (row.library_delete[0] != '0') {
          await db.query(
            'UPDATE users SET library_delete = 0 WHERE user_id = ?',
            [row.user_id]
          );
        }
      } else if (row.notify) {
        // Email user about reaching limit
        const message = `
          Your library has exceeded its size limit of ${
            row.library_size_limit
          }GB.

          If you do not act to increase your size limit or decrease your library size your entire library will be deleted seven days after first reaching the limit. This action cannot be undone and your files will not be retrievable.
        `;
        sendEmail(
          row.email,
          'Xyfir Books - Library Size Limit Reached',
          message
        );

        // Library's first time going over limit: set library_delete
        if (row.library_delete[0] == '0') {
          await db.query(
            `
            UPDATE users SET library_delete = DATE_ADD(NOW(), INTERVAL 7 DAY)
            WHERE user_id = ?
          `,
            [row.user_id]
          );
        }
      } else if (row.deleteLibrary) {
        res = await request.delete(
          config.addresses.library + 'libraries/' + row.library_id
        );

        if (res.body.error) return;

        await db.query('UPDATE users SET library_wiped = 1 WHERE user_id = ?', [
          row.user_id
        ]);

        // Notify user that their library was deleted
        const message = `
          Your Xyfir Books library has been deleted.

          This occured because your library was at or over the size limit for over 7 days.

          This action cannot be undone.
        `;

        sendEmail(row.email, 'Xyfir Books - Library Deleted', message);
      }
    }

    db.release();
  } catch (err) {
    db.release();
    console.error('jobs/cron/enforce-library-size-limit', err);
  }
};
