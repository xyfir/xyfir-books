"use strict";

const db = require("../../lib/db");

/*
    PUT api/books/:book
    REQUIRED
        type: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Increments an ebook's metadata or cover version
*/
module.exports = function(req, res) { 

    const column = req.body.type == "metadata" ? "version_metadata" : "version_cover";
    const sql = `
        UPDATE books SET ${column} = ${column} + 1 WHERE user_id ? AND book_id = ?
    `;
    const vars = [req.session.uid, req.params.book];
    
    db(cn => cn.query(sql, (err, result) => {
        cn.release();
        res.json({ error: !!err || !result.affectedRows });
    }));
    
};