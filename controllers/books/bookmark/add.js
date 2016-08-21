const db = require("../../../lib/db");

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
        cfi: req.body.cfi, created: Date.now()
    };
    const sql = `INSERT INTO bookmarks SET ?`;
    
    db(cn => cn.query(sql, insert, (err, result) => {
        cn.release();
        res.json({ error: !!err || !result.affectedRows });
    }));
    
};