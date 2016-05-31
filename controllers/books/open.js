"use strict";

const db = require("../../lib/db");

/*
    GET api/books/:book
    RETURN
        {
            notes: [{ cfi: string, note: string, created: number }],
            bookmarks: [{ cfi: string, created: number }],
            last_read: number
        }
    DESCRIPTION
        Returns all notes / highlighted text and bookmarks for a book
        Update book's last_read
*/
module.exports = function(req, res) { 

    // Get notes
    let vars = [req.session.uid, req.params.book];
    let sql = `
        SELECT cfi, note, created FROM notes WHERE user_id = ? AND book_id = ?
        ORDER BY created DESC
    `;
    
    db(cn => cn.query(sql, vars, (err, rows) => {
        let response = { bookmarks: [], notes: [], last_read: 0 };
        
        if (err) {
            cn.release();
            res.json(response);
        }
        else {
            response.notes = rows;
            
            // Get bookmarks
            sql = `
                SELECT cfi, created FROM bookmarks WHERE user_id = ? AND book_id = ?
                ORDER BY created DESC
            `;
            cn.query(sql, vars, (err, rows) => {
                response.bookmarks = rows;
                response.last_read = Date.now();
                
                res.json(response);
                
                // Update last_read
                sql = "UPDATE books SET last_read = ? WHERE user_id = ? AND book_id = ?";
                vars = [response.last_read, req.session.uid, req.params.book];
                
                cn.query(sql, vars, (err, result) => cn.release());
            });
        }
    }));
    
};