const path = require('path');
require('app-module-path').addPath(path.resolve(__dirname, '../'));

const request = require('superagent');
const config = require('config');
const MySQL = require('lib/mysql');

/**
 * 1. Load data from xyBooks' database for all users' libraries
 * 2. Add `xy__` columns to their libraries
 * 3. Send data stored in xyBooks to their xyLibrary library
 */
(async function() {

  const db = new MySQL;

  try {
    await db.getConnection();
    const users = await db.query(
      'SELECT user_id AS id, library_id AS library FROM users'
    );

    for (let user of users) {
      console.log(`Converting user #${user.id}'s library ${user.library}`);
      let res;

      // Convert library
      try {
        res = await request.post(
          `${config.addresses.library}libraries/${user.library}/upgrade`
        );

        if (res.body.error) throw res.body;
      }
      catch (err) {
        console.error(`Could not convert ${user.library}`, err);
        return;
      }

      console.log('Loading book data from xyBooks DB');

      // Load books/notes/bookmarks
      const bookmarks = await db.query(
        'SELECT * FROM bookmarks WHERE user_id = ?',
        [user.id]
      );
      const books = await db.query(
        'SELECT * FROM books WHERE user_id = ?',
        [user.id]
      );
      const notes = await db.query(
        'SELECT * FROM notes WHERE user_id = ?',
        [user.id]
      );

      // Loop through books setting notes metadata
      for (let book of books) {
        console.log(`Updating book #${book.book_id}`);

        book.bookmarks = bookmarks
          .filter(b => book.book_id == b.book_id)
          .map(b => ({
            cfi: b.cfi, created: b.created
          })),
        book.notes = notes
          .filter(n => book.book_id = n.book_id)
          .map(n => ({
            cfi: n.cfi,
            created: n.created,
            content: n.content,
            cfi_range: JSON.parse(n.cfi_range),
            highlights: JSON.parse(n.highlights)
          }));

        try {
          res = await request
            .put(
              `${config.addresses.library}libraries/${user.library}` +
              `/books/${book.book_id}/metadata`
            )
            .send({
              xyfir: {
                words: book.word_count,
                notes: JSON.stringify(book.notes),
                percent: book.percent_complete,
                last_read: book.last_read,
                bookmarks: JSON.stringify(book.bookmarks)
              }
            });

          if (res.body.error) throw res.body;
        }
        catch (err) {
          return console.error(`Could not update book #${book.book_id}`, err);
        }
      }
    }

    db.release();
    console.log('Job complete');
  }
  catch (err) {
    db.release();
    console.error('jobs/upgrade-libraries', err);
  }

})()