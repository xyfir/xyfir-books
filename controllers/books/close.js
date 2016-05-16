"use strict";

const db = require("../../lib/db");

/*
    POST api/books/:book/close
    REQUIRED
        percentComplete: number
    RETURN
        { last_read: number }
    DESCRIPTION
        Update book's percent_complete / last_read
*/
module.exports = function(req, res) { 

    const sql = `
        UPDATE books SET percent_complete = ?, last_read = ?
        WHERE user_id = ? AND book_id = ?
    `;
    const vars = [
        req.body.percentComplete, Date.now(),
        req.session.uid, req.params.book
    ];
    
    db(cn => cn.query(sql, vars, (err, result) => {
        cn.release();
        res.json({ last_read: vars[1] });
    }));
    
};