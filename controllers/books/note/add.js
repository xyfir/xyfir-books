"use strict";

const db = require("../../../lib/db");

/*
    POST api/books/:book/note
    REQUIRED
        cfi: string, note: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Adds a note to highlighted text at body.cfi in :book
*/
module.exports = function(req, res) { 

    const insert = {
        user_id: req.session.uid, book_id: req.params.book,
        cfi: req.body.cfi, note: req.body.note
    };
    const sql = `INSERT INTO notes SET ?`;
    
    db(cn => cn.query(sql, insert, (err, result) => {
        cn.release();
        res.json({ error: !!err || !result.affectedRows });
    }));
    
};