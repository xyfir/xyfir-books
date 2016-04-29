"use strict";

const db = require("../../lib/db");

/*
    GET api/books/:book
    RETURN
        {
            bookmarks: [{ cfi: string, created: number }],
            notes: [{ cfi: string, note }]
        }
    DESCRIPTION
        Returns all notes / highlighted text and bookmarks for a book
*/
module.exports = function(req, res) { 

    const vars = [req.session.uid, req.params.book];
    let sql = "SELECT cfi, note FROM notes WHERE user_id = ? AND book_id = ?";
    
    db(cn => cn.query(sql, vars, (err, rows) => {
        let response = { bookmarks: [], notes: [] };
        
        if (err) {
            cn.release();
            res.json(response);
        }
        else {
            response.notes = rows;
            
            sql = "SELECT cfi, created FROM bookmarks WHERE user_id = ? AND book_id = ?";
            
            cn.query(sql, vars, (err, rows) => {
                cn.release();
                
                response.bookmarks = rows;
                res.json(response);
            });
        }
    }));
    
};