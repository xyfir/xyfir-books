"use strict";

const db = require("../../lib/db");

/*
    PUT api/library-manager/:server/space
    REQUIRED
        free: number
    RETURN
        { error: boolean }
    DESCRIPTION
        Update a library manager server's free space
*/
module.exports = function(req, res) { 

    // Update free space for library server
    let sql = "UPDATE servers SET space_free = ? WHERE server_id = ?";
    let vars = [req.body.free, req.params.server];
    
    db(cn => cn.query(sql, vars, (err, result) => {
        cn.release();
        res.json({ error: !!err || !result.affectedRows });
    }));
    
};