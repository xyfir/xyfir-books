const db = require("../../lib/db");

/*
    POST api/library-manager/:server/:lib/library
    REQUIRED
        freeSpace: number, ids: string
    RETURN
        { error: boolean }
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
            res.json({ error: true });
        }
        else {
            const uid = rows[0].user_id;

            // Delete existing books
            sql = "DELETE FROM books WHERE user_id = ?";
            vars = [uid];
            
            cn.query(sql, vars, (err, result) => {
                if (err) {
                    cn.release();
                    res.json({ error: true });
                }
                else {
                    const ids = req.body.ids.split(',');
                    
                    // Insert new books
                    sql = "INSERT INTO books (user_id, book_id) VALUES ";                    
                    sql += ids.map(id => {
                        return `('${uid}', '${+id}')`;
                    }).join(", ");
                    
                    cn.query(sql, (err, result) => {
                        if (err || !result.affectedRows) {
                            cn.release();
                            res.json({ error: true });
                        }
                        else {
                            // Update free space for library server
                            sql = "UPDATE servers SET space_free = ? WHERE server_id = ?";
                            vars = [req.body.freeSpace, req.params.server];
                            
                            cn.query(sql, vars, (err, result) => {
                                cn.release();
                                
                                res.json({ error: !!err || !result.affectedRows });
                            });
                        }
                    });
                }
            });
        }
    }));
    
};