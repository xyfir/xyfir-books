const mysql = require('lib/mysql');

/*
  GET api/books/:book
  RETURN
    {
      notes: [{
        cfi: string, content: string, created: number, highlights: string[],
        range: {
          start: string, end: string
        }
      }],
      bookmarks: [{
        cfi: string, created: number
      }],
      last_read: number
    }
  DESCRIPTION
    Returns all notes / highlighted text and bookmarks for a book
    Update book's last_read
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();

    // Get notes
    let sql = `
      SELECT
        cfi, created, content, highlights, cfi_range AS 'range'
      FROM notes
        WHERE user_id = ? AND book_id = ?
      ORDER BY created DESC
    `,
    vars = [
      req.session.uid, req.params.book
    ],
    rows = await db.query(sql, vars);

    const response = { bookmarks: [], notes: rows, last_read: 0 };

    // Get bookmarks
    sql = `
      SELECT cfi, created FROM bookmarks WHERE user_id = ? AND book_id = ?
      ORDER BY created DESC
    `,
    rows = await db.query(sql, vars);

    response.bookmarks = rows,
    response.last_read = Date.now();

    // Update last_read
    sql = `
      UPDATE books SET last_read = ? WHERE user_id = ? AND book_id = ?
    `,
    vars = [
      response.last_read, req.session.uid, req.params.book
    ];
    
    await db.query(sql, vars);
    db.release();

    // Parse highlights and range
    response.notes = response.notes.map(note => {
      note.range = JSON.parse(note.range),
      note.highlights = JSON.parse(note.highlights);
      return note;
    });

    res.json(response);
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
  
};