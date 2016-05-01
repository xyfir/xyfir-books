"use strict";

const request = require("request");
const db = require("../../lib/db");

/*
    PUT api/library-manager/space
    REQUIRED
        bytes: number
    RETURN
        { error: boolean, libraryServerAddress?: string }
    DESCRIPTION
        Determines if user has enough space on storage server to peform action
        Attempts to move library to a server with more space if needed
*/
module.exports = function(req, res) { 

    let sql = "SELECT * FROM servers";
    
    db(cn => cn.query(sql, vars, (err, rows) => {
        const server = rows.find(s => { return s.server_id == req.session.library.server; });
        
        if (server === undefined) {
            cn.release();
            res.json({ error: true });
            return;
        }
        
        // Make sure server has double the space needed while still leaving 10% available
        if ((req.body.bytes * 2) + (server.space_total * 0.1) > server.space_free) {
            // Libyq Select users must upgrade their server
            if (!(++server.is_select)) {
                cn.release();
                res.json({ error: true });
            }
            // Attempt to find a server with enough space
            else {
                const matches = rows.filter(s => {
                    return (
                        !!(+s.is_select)
                        &&
                        (req.body.bytes * 2) + (s.space_total * 0.1) < s.space_free
                        &&
                        s.library_limit > s.library_count
                    );
                });
                
                if (matches.length == 0) {
                    cn.release();
                    res.json({ error: true });
                }
                // Attempt to move library to new server
                else {
                    // Move from server.address -> matches[0].address
                    request.put({
                        url: req.session.library.server, form: { toServer: matches[0].address }
                    }, (err, response, body) => {
                        body = JSON.parse(body);
                        
                        if (body.error) {
                            cn.release();
                            res.json({ error: true });
                            return;
                        }
                        
                        res.json({ error: false, libraryServerAddress: matches[0].address });
                        
                        // Update library's old server's free space
                        sql = "UPDATE servers SET space_free = ? WHERE server_id = ?";
                        let vars = [body.freeSpace, req.session.library.server];
                        
                        cn.query(sql, vars, (err, result) => {
                            // Modify library server in users table and session object
                            sql = "UPDATE users SET library_server_id = ? WHERE user_id = ?";
                            vars = [matches[0].server_id, req.session.uid];
                            
                            cn.query(sql, vars, (err, result) => {
                                cn.release();
                                
                                req.session.library.address = matches[0].address;
                                req.session.library.server = matches[0].server_id;
                            });
                        });
                    });
                }
            }
        }
        else {
            res.json({ error: false });
        }
    }));
    
};