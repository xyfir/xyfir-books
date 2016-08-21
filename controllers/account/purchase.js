const randString = require("randomstring");
const request = require("request");
const db = require("../../lib/db");

/*
    PUT api/account/subscription
    REQUIRED
        stripeToken: string, subscription: number
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Add time to user's subscription after charging card via Stripe
*/
module.exports = function (req, res) {

    const subscriptions = {
        '1': { days: 30, cost: 400 },
        '2': { days: 182, cost: 2100 },
        '3': { days: 365, cost: 3600 }
    };

    const stripeKey = require("../../config").keys.stripe;

    if (subscriptions[req.body.subscription] === undefined) {
        res.json({ error: true, message: "Invalid subscription length" });
        return;
    }

    let info = {
        amount: subscriptions[req.body.subscription].cost, source: req.body.stripeToken,
        description: "Ptorx - Premium Subscription", currency: "usd"
    };

    require("stripe")(stripeKey).charges.create(info, (err, charge) => {
        if (err) {
            res.json({ error: true, message: "Error processing your card. Please try again." });
            return;
        }

        let sql = `
            SELECT subscription, library_id FROM users WHERE user_id = ?
        `;
        db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
            if (err || !rows.length) {
                cn.release();
                res.json({ error: true, message: "An unknown error occured" });
                return;
            }
            
            // Add months to current subscription expiration (or now())
            let subscription;
            
            // Set subscription expiration
            if (Date.now() > rows[0].subscription)
                subscription = Date.now() + (subscriptions[req.body.subscription].days * 86400 * 1000);
            else
                subscription = rows[0].subscription + (subscriptions[req.body.subscription].days * 86400 * 1000);

            sql = `
                UPDATE users SET subscription = ? WHERE user_id = ?
            `;
            cn.query(sql, [subscription, req.session.uid], (err, result) => {
                if (err || !result.affectedRows) {
                    cn.release();
                    res.json({ error: true, message: "Contact support" });
                }
                else if (rows[0].library_id == '') {
                    // We need to create a library for user, find library-manager server
                    sql = `
                        SELECT * FROM servers WHERE is_select = 0 AND space_free > 100000000 + (space_total * 0.1)
                        AND library_limit > library_count LIMIT 1
                    `;
                    
                    cn.query(sql, (err, rows) => {
                        if (err || !rows.length) {
                            cn.release();
                            res.json({ error: true, message: "Contact support" });
                            return;
                        }
                        
                        const library = req.session.uid + '-' + randString.generate(40);
                        
                        // Update user's library / library server id
                        sql = "UPDATE users SET library_id = ?, library_server_id = ? WHERE user_id = ?";
                        let vars = [library, rows[0].server_id, req.session.uid];
                        
                        cn.query(sql, vars, (err, result) => {
                            if (err || !result.affectedRows) {
                                cn.release();
                                res.json({ error: true, message: "Contact support" });
                                return;
                            }
                            
                            // Create library on server
                            request.post(rows[0].address + "library/" + library, (err, response, body) => {
                                if (err) {
                                    cn.release();
                                    res.json({ error: true, message: "Contact support" });
                                    return;
                                }
                                
                                body = JSON.parse(body);
                                
                                if (body.error) {
                                    cn.release();
                                    res.json({ error: true, message: "Contact support" });
                                    return;
                                }
                                
                                // Update server's library_count
                                sql = `
                                    UPDATE servers SET library_count = library_count + 1 WHERE server_id = ?    
                                `;
                                
                                cn.query(sql, [rows[0].server_id], (err, result) => {
                                    res.json({ error: false, message: "" });
                                
                                    req.session.library = {
                                        id: library, address: rows[0].address, server: rows[0].server_id
                                    };
                                    req.session.subscription = subscription;
                                });
                            });
                        });
                    });
                }
                else {
                    cn.release();
                    
                    req.session.subscription = subscription;
                    res.json({ error: false, message: "" });
                }
            });
        }));
    });

};