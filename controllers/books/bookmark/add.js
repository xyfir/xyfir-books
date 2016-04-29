"use strict";

const db = require("../../lib/db");

/*
    POST api/books/:book/bookmark
    REQUIRED
        cfi: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Adds a bookmark at body.cfi to :book
*/
module.exports = function(req, res) { 

    const insert = {
        user_id: req.session.uid, book_id: req.params.book,
        cfi: req.body.cfi, created: Math.round(Date.now() / 1000)
    };
    const sql = `INSERT INTO bookmarks SET ?`;
    
    db(cn => cn.query(sql, insert, (err, result) => {
        cn.release();
        res.json({ error: !!err || !result.affectedRows });
    }));
    
};