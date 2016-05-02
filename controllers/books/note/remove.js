"use strict";

const db = require("../../../lib/db");

/*
    DELETE api/books/:book/note
    REQUIRED
        cfi: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Delete note at body.cfi from :book
*/
module.exports = function(req, res) { 

    const sql = `DELETE FROM notes WHERE user_id = ? AND book_id = ? AND cfi = ?`;
    const vars = [req.session.uid, req.params.book, req.body.cfi];
    
    db(cn => cn.query(sql, vars, (err, result) => {
        cn.release();
        res.json({ error: !!err || !result.affectedRows });
    }));
    
};