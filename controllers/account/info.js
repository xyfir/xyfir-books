const request = require("request");
const crypto = require("lib/crypto");
const db = require("lib/db");

const config = require("config");

/*
    GET api/account
    REQUIRED
        token: string
    RETURN
        {
            library: string, subscription:? number,
            librarySizeLimit?: number
        }
    DESCRIPTION
        Creates a new session using access token
        Return account info
*/
module.exports = function(req, res) {

    db(cn => {
        let sql = "";

        const getInfo = (uid) => {
            sql = `
                SELECT
                    library_size_limit as librarySizeLimit, subscription, library_id as library
                FROM users WHERE user_id = ?
            `;

            cn.query(sql, [req.session.uid], (err, rows) => {
                cn.release();

                if (err || !rows.length)
                    res.json({ library: "" });
                else
                    res.json(rows[0]);
            });
        };

        // Validate access token
        if (req.query.token) {
            // [user_id, access_token]
            const token = crypto.decrypt(
                req.query.token, config.keys.accessToken
            ).split('-');

            // Invalid token
            if (!token[0] || !token[1]) {
                cn.release();
                res.json({ library: "" });
                return;
            }

            // Get user's Xyfir ID
            sql = `SELECT xyfir_id FROM users WHERE user_id = ?`;

            cn.query(sql, [token[0]], (err, rows) => {
                // User doesn't exist
                if (err || !rows.length) {
                    cn.release();
                    res.json({ library: "" });
                }
                // Validate access token with Xyfir Accounts
                else {
                    let url = config.addresses.xacc + "api/service/14/"
                    + `${config.keys.xacc}/${rows[0].xyfir_id}/${token[1]}`;

                    request(url, (err, response, body) => {
                        // Error in request
                        if (err) {
                            cn.release();
                            res.json({ library: "" });
                            return;
                        }

                        body = JSON.parse(body);

                        // Error from Xyfir Accounts
                        if (body.error) {
                            req.session.xadid = req.session.library = "";
                            req.session.uid = req.session.subscription = 0;
                            
                            cn.release();
                            res.json({ library: "" });
                        }
                        // Access token valid
                        else {
                            getInfo(token[0]);
                        }
                    });
                }
            });
        }
        // Get info for dev user
        else if (config.environment.type == "dev") {
            getInfo(1);
        }
        // Force login
        else {
            cn.release();
            res.json({ library: "" });
        }
    });
    
};