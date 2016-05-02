"use strict";

const randString = require("randomstring");
const request = require("request");
const db = require("../../lib/db");

/*
    POST api/account/login
    REQUIRED
        xid: string, auth: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Register or login user
        Create a library for new users
*/
module.exports = function(req, res) {

    let url = require("../../config").addresses.xacc
        + `api/service/14/${req.body.xid}/${req.body.auth}`;

    request(url, (err, response, body) => {
        body = JSON.parse(body);

        if (body.error) {
            res.json({ error: true });
            return;
        }

        let sql = `SELECT user_id, subscription, xad_id FROM users WHERE xyfir_id = ?`;
        db(cn => cn.query(sql, [req.body.xid], (err, rows) => {
            // First login (registration)
            if (!rows.length) {
                // Create user
                let insert = {
                    xyfir_id: req.body.xid, email: body.email, xad_id: body.xadid
                };
                sql = "INSERT INTO users SET ?";
                
                cn.query(sql, insert, (err, result) => {
                    if (err || !result.affectedRows) {
                        cn.release();
                        res.json({ error: true });
                    }
                    else {
                        // Find a library-manager server to use
                        sql = `
                            SELECT * FROM servers WHERE is_select = 0 AND space_free > 100000000 + (space_total * 0.1)
                            AND library_limit > library_count LIMIT 1
                        `;
                        cn.query(sql, (err, rows) => {
                            if (err || !rows.length) {
                                cn.release();
                                res.json({ error: false });
                            }
                            else {
                                req.session.uid = result.insertId;
                                
                                const library = result.insertId + '-' + randString.generate(40);

                                // Set user's library and server id
                                sql = `
                                    UPDATE users SET library_server_id = ? AND library_id = ? WHERE user_id = ?
                                `;
                                let vars = [rows[0].server_id, library, result.insertId];
                                
                                cn.query(sql, vars, (err, result) => {
                                    cn.release();
                                    res.json({ error: false });
                                    
                                    req.session.xadid = body.xadid;
                                    req.session.subscription = 0;
                                    req.session.library = {
                                        address: rows[0].address, server: rows[0].server_id, id: library
                                    };
                                });
                            }
                        });
                    }
                });
            }
            // Update data
            else {
                sql = "UPDATE users SET email = ? WHERE user_id = ?"
                cn.query(sql, [body.email, rows[0].user_id], (err, result) => {
                    cn.release();

                    if (err) {
                        res.json({ error: true });
                    }
                    else {
                        req.session.uid = rows[0].user_id;
                        req.session.xadid = rows[0].xad_id;
                        req.session.subscription = rows[0].subscription;

                        res.json({ error: false });
                    }
                });
            }
        }));
    });

};