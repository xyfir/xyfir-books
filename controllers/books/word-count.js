"use strict";

const db = require("../../lib/db");

/*
    PUT api/books/:book/word-count
    REQUIRED
        count: number
    RETURN
        { error: boolean }
    DESCRIPTION
        Update book's word count
*/
module.exports = function(req, res) { 

    const sql = `
        UPDATE books SET word_count = ? WHERE user_id = ? AND book_id = ?
    `;
    const vars = [
        req.body.count, req.session.uid, req.params.book
    ];
    
    db(cn => cn.query(sql, vars, (err, result) => {
        cn.release();
        res.json({ error: !!err || !result.affectedRows });
    }));
    
};