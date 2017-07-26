const mysql = require('lib/mysql');

/*
  PUT api/account
  OPTIONAL
    xyAnnotationsKey: string
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Updates provided values
    Currently only updates xyAnnotationsKey
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();

    const sql = `
      UPDATE users SET xyannotations_key = ?
      WHERE user_id = ?
    `,
    vars = [
      req.body.xyAnnotationsKey,
      req.session.uid
    ],
    result = await db.query(sql, vars);

    if (!result.affectedRows) throw 'Could not update';

    db.release();
    res.json({ error: false });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
  
};