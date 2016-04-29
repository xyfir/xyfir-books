"use strict";

const db = require("../../lib/db");

/*
    GET api/books
    RETURN
        { books: [
            { id: number, versionMetadata: number, versionCover: number }
        ] }
    DESCRIPTION
        Returns metadata / cover versions for all books in library
*/
module.exports = function(req, res) { 

    const sql = `
        SELECT book_id as id, version_metadata as versionMetadata, version_cover as versionCover
        FROM books WHERE user_id = ?
    `;
    
    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();
        res.json({ books: err || !rows.length ? [] : rows });
    }));
    
};