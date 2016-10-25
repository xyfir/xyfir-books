const request = require("request");
const db = require("lib/db");

const config = require("config");

/*
    DELETE api/books
    REQUIRED
        ids: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Requests books to be deleted via library manager
        Deletes books from database if removed from library
*/
module.exports = function(req, res) { 

    request.del({
        url: config.addresses.library + req.session.library + "/books",
        form: { books: req.body.ids }
    }, (err, response, body) => {
        if (err) {
            res.json({ error: true });
        }
        else {
            body = JSON.parse(body);
            
            if (body.error) {
                res.json(body);
            }
            else {
                // Delete books and their bookmarks and notes
                let sql = `
                    DELETE b, bm, n
                    FROM books b
                    JOIN bookmarks bm ON bm.user_id = b.user_id AND bm.book_id = b.book_id
                    JOIN notes n ON n.user_id = b.user_id AND n.book_id = b.book_id
                    WHERE b.user_id = ? AND b.book_id IN (?)
                `, vars = [
                    req.session.uid, req.body.ids.split(',')
                ];
                
                db(cn => cn.query(sql, vars, (err, result) => {
                    cn.release();
                    res.json({ error: !!err });
                }));
            }
        }
    });
    
};