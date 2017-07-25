const request = require('superagent');
const mysql = require('lib/mysql');

const config = require('config');

/*
  DELETE api/books
  REQUIRED
    ids: string
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Requests books to be deleted via library manager
    Deletes books from database if removed from library
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    const xyLibRes = await request
      .delete(
        config.addresses.library + 'libraries/' +
        req.session.library + '/books'
      )
      .send({ books: req.body.ids });

    if (xyLibRes.body.error) throw xyLibRes.body.message || 'xyLibrary error';

    const vars = [
      req.session.uid, req.body.ids.split(',')
    ];

    let sql = `
      DELETE FROM books WHERE user_id = ? AND book_id IN (?)
    `;
    
    await db.getConnection();
    await db.query(sql, vars);

    sql = `
      DELETE FROM bookmarks WHERE user_id = ? AND book_id IN (?)
    `;
    await db.query(sql, vars);

    sql = `
      DELETE FROM notes WHERE user_id = ? AND book_id IN (?)
    `;
    await db.query(sql, vars);
    db.release();

    res.json({ error: false });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
  
};