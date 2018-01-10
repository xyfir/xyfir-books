const MySQL = require('lib/mysql');

/*
  GET api/books
  RETURN
    {
      error: boolean, message?: string,
      books: [{
        id: number, percent_complete: number, word_count: number,
        last_read: number, bookmarks: [], notes: []
      }]
    }
  DESCRIPTION
    Returns info for all books in library
*/
module.exports = async function(req, res) {

  const db = new MySQL;

  try {
    await db.getConnection();
    const books = await db.query(`
      SELECT book_id AS id, percent_complete, word_count, last_read
      FROM books WHERE user_id = ?
    `, [
      req.session.uid
    ]);
    db.release();

    books.forEach((book, i) => {
      books[i].bookmarks = [];
      books[i].notes = [];
    });

    res.json({ error: false, books });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err, books: [] });
  }

};