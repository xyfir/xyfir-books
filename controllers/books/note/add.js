const mysql = require('lib/mysql');

/*
  POST api/books/:book/note
  REQUIRED
    cfi: string, content: string, highlights: json-string, range: json-string,
    created: number
  RETURN
    { error: boolean }
  DESCRIPTION
    Adds a note to highlighted text at body.cfi in :book
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();

    const sql = `
      INSERT INTO notes SET ?
    `,
    insert = {
      user_id: req.session.uid, book_id: req.params.book, cfi: req.body.cfi,
      content: req.body.content, highlights: req.body.highlights,
      cfi_range: req.body.range, created: req.body.created
    },
    result = await db.query(sql, insert);

    db.release();
    res.json({ error: !result.affectedRows });
  }
  catch (err) {
    db.release();
    res.json({ error: true });
  }
  
};