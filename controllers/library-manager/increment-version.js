const db = require("../../lib/db");

/*
    PUT api/library-manager/:server/:lib/books/:book
    REQUIRED
        type: string, freeSpace: number
    RETURN
        { error: boolean, message?: string }
    DESCRIPTION
        Increments an ebook's metadata or cover version
        Updates library server's free space
*/
module.exports = function(req, res) { 

    const column = req.body.type == "metadata" ? "version_metadata" : "version_cover";
    
    let sql = `
        SELECT user_id FROM users WHERE library_server_id = ? AND library_id = ?
    `;
    let vars = [req.params.server, req.params.lib];
    
    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            cn.release();
            res.json({ error: true, message: "Library does not exist" });
        }
        else {
            const uid = rows[0].user_id;
            
            sql = `UPDATE books SET ${column} = ${column} + 1 WHERE user_id = ? AND book_id = ?`;
            vars = [uid, req.params.book];
            
            cn.query(sql, vars, (err, result) => {
                if (err || !result.affectedRows) {
                    cn.release();
                    res.json({ error: true, message: "Could not increment version" });
                }
                else {
                    sql = "UPDATE servers SET space_free = ? WHERE server_id = ?";
                    vars = [req.body.freeSpace, req.params.server];
                    
                    cn.query(sql, vars, (err, result) => {
                        cn.release();
                        res.json({ error: false });
                    });
                }
            });
        }
    }));
    
};