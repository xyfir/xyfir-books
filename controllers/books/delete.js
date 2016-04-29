"use strict";

const request = require("request");
const db = require("../../lib/db");

/*
    DELETE api/books
    REQUIRED
        ids: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Requests books to be deleted via library manager
        Deletes books from database and updates server's space if removed from library
*/
module.exports = function(req, res) { 

    request.del({
        url: `${req.session.library.address}/library/${req.session.library.id}/books`,
        form: { ids }
    }, (err, response, body) => {
        if (err) {
            res.json({ error: true });
        }
        else {
            body = JSON.parse(body);
            
            if (body.error) {
                res.json({ error: true });
            }
            else {
                let sql = "DELETE FROM books WHERE user_id = ? AND book_id IN (?)";
                let vars = [req.session.uid, req.body.ids.split(',')];
                
                db(cn => cn.query(sql, vars, (err, result) => {
                    if (err) {
                        cn.release();
                        res.json({ error: true });
                    }
                    else {
                        sql = "UPDATE servers SET space_free = ? WHERE server_id = ?";
                        vars = [body.freeSpace, req.session.library.server];
                        
                        cn.query(sql, vars, (err, result) => {
                            cn.release();
                            
                            res.json({ error: false });
                        });
                    }
                }));
            }
        }
    });
    
};