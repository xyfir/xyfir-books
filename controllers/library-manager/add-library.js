const db = require("lib/db");

/*
    POST api/library-manager/:lib/library
    REQUIRED
        ids: string
    RETURN
        { error: boolean, message?: string }
    DESCRIPTION
        Replace all books in library with books in uploaded library
*/
module.exports = function(req, res) { 

    // Grab user_id from library_id
    let sql = "SELECT user_id FROM users WHERE library_id = ?";
    let vars = [req.params.lib];
    
    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            cn.release();
            res.json({ error: true, message: "Invalid library" });
        }
        else {
            const uid = rows[0].user_id;

            // Delete existing books
            sql = "DELETE FROM books WHERE user_id = ?";
            vars = [uid];
            
            cn.query(sql, vars, (err, result) => {
                if (err) {
                    cn.release();
                    res.json({
                        error: true, message: "Could not wipe old library"
                    });
                }
                else {
                    const ids = req.body.ids.split(',');
                    
                    // Insert new books
                    sql = "INSERT INTO books (user_id, book_id) VALUES ";                    
                    sql += ids.map(id => {
                        return `('${uid}', '${+id}')`;
                    }).join(", ");
                    
                    cn.query(sql, (err, result) => {
                        cn.release();
                        res.json({ error: !!err || !result.affectedRows });
                    });
                }
            });
        }
    }));
    
};