const randString = require("randomstring");
const request = require("request");
const crypto = require("lib/crypto");
const db = require("lib/db");

const config = require("config");

/*
    POST api/account/login
    REQUIRED
        xid: string, auth: string
    OPTIONAL
        affiliate: string, referral: number
    RETURN
        { error: boolean, accessToken?: string }
    DESCRIPTION
        Register or login user
        Create a library for new users
*/
module.exports = function(req, res) {

    let url = config.addresses.xacc
        + "api/service/14/" + config.keys.xacc
        + "/" + req.body.xid
        + "/" + req.body.auth;

    request(url, (err, response, body) => {
        if (err) {
            res.json({ error: true });
            return;
        }

        body = JSON.parse(body);

        if (body.error) {
            res.json({ error: true });
            return;
        }

        const token = body.accessToken;

        let sql = `
            SELECT user_id, subscription, xad_id FROM users WHERE xyfir_id = ?
        `;

        db(cn => cn.query(sql, [req.body.xid], (err, rows) => {
            if (err) {
                cn.release();
                res.json({ error: true });
            }
            
            /* First Login (Registration) */
            else if (!rows.length) {
                const subscription = Date.now() + (7 * 86400000);

                // Create user
                let insert = {
                    xyfir_id: req.body.xid, email: body.email, xad_id: body.xadid,
                    subscription
                };
                sql = "INSERT INTO users SET ?";
                
                cn.query(sql, insert, (err, result) => {
                    if (err || !result.affectedRows) {
                        cn.release();
                        res.json({ error: true });
                        return;
                    }
                    
                    req.session.uid = result.insertId;
                    
                    // Generate user's library id
                    const library = result.insertId
                        + '-' + randString.generate(40);

                    // Create library on library server
                    request.post({
                        url: config.addresses.library + library
                    }, (err, response, body) => {
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

                        let referral = "{}";

                        const finish = () => {
                            // Set user's library id
                            sql = `
                                UPDATE users SET library_id = ?, referral = ?
                                WHERE user_id = ?
                            `, vars = [
                                library, referral,
                                req.session.uid
                            ];
                            
                            cn.query(sql, vars, (err, result) => {
                                cn.release();
                                
                                res.json({
                                    error: false, accessToken: crypto.encrypt(
                                        req.session.uid + "-" + token,
                                        config.keys.accessToken
                                    )
                                });
                                
                                req.session.subscription = subscription;
                                req.session.library = library;
                                req.session.xadid = body.xadid;
                            });
                        };

                        if (req.body.referral) {
                            referral = JSON.stringify({
                                referral: req.body.referral,
                                hasMadePurchase: false
                            });
                            finish();
                        }
                        // Validate affiliate promo code
                        else if (req.body.affiliate) {
                            request.post({
                                url: config.address.xacc + "api/affiliate/signup",
                                form: {
                                    service: 14, serviceKey: config.keys.xacc,
                                    promoCode: req.body.affiliate
                                }
                            }, (err, response, body) => {
                                if (err) {
                                    finish();
                                }
                                else {
                                    body = JSON.parse(body);

                                    if (!body.error && body.promo == 5) {
                                        referral = JSON.stringify({
                                            affiliate: req.body.affiliate,
                                            hasMadePurchase: false
                                        });
                                    }
                                    finish();
                                }
                            });
                        }
                        else {
                            finish();
                        }
                    });
                });
            }

            /* Update Data */
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

                        res.json({
                            error: false, accessToken: crypto.encrypt(
                                req.session.uid + "-" + token,
                                config.keys.accessToken
                            )
                        });
                    }
                });
            }
        }));
    });

};