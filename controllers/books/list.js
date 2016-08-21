const db = require("../../lib/db");

/*
    GET api/books
    RETURN
        { books: [
            {
                id: number, version_metadata: number, version_cover: number,
                percent_complete: number, word_count: number,
                last_read: number, bookmarks: [], notes: []
            }
        ] }
    DESCRIPTION
        Returns info for all books in library
*/
module.exports = function(req, res) { 

    const sql = `
        SELECT book_id as id, version_metadata, version_cover,
        percent_complete, word_count, last_read
        FROM books WHERE user_id = ?
    `;
    
    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();
        
        if (err || !rows.length) {
            res.json({ books: [] });
        }
        else {
            rows.forEach((row, i) => {
                rows[i].bookmarks = [];
                rows[i].notes = [];
            });
            
            res.json({ books: rows });
        }
    }));
    
};