const mysql = require('lib/mysql');

/*
  DELETE api/books/:book/note
  REQUIRED
    created: number
  RETURN
    { error: boolean }
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();

    const sql = `
      DELETE FROM notes WHERE user_id = ? AND book_id = ? AND created = ?
    `,
    vars = [
      req.session.uid, req.params.book, req.body.created
    ],
    result = await db.query(sql, vars);

    db.release();
    res.json({ error: !result.affectedRows });
  }
  catch (err) {
    db.release();
    res.json({ error: true });
  }
  
};