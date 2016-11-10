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
            library: string, subscription:? number, uid?: number, xadid?: string,
            librarySizeLimit?: number, referral?: {
                referral?: number, affiliate?: string,
                hasMadePurchase?: boolean
            }
        }
    DESCRIPTION
        Creates a new session using access token
        Return account info
*/
module.exports = function(req, res) {

    // Wipe session, return empty library ID
    const error = () => {
        req.session.xadid = req.session.library = "";
        req.session.uid = req.session.subscription = 0;

        res.json({ library: "" });
    };

    db(cn => {
        let sql = "";

        const getInfo = (uid) => {
            sql = `
                SELECT
                    library_size_limit as librarySizeLimit, subscription,
                    library_id as library, xad_id as xadid, referral,
                    user_id as uid
                FROM users WHERE user_id = ?
            `;

            cn.query(sql, [uid], (err, rows) => {
                cn.release();

                if (err || !rows.length) {
                    error();
                }
                else {
                    rows[0].referral = JSON.parse(rows[0].referral);

                    // Set session, return account info
                    req.session.uid = uid,
                    req.session.xadid = rows[0].xadid,
                    req.session.library = rows[0].library,
                    req.session.subscription = rows[0].subscription;
                    
                    res.json(rows[0]);
                }
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
                error();
                return;
            }

            // Get user's Xyfir ID
            sql = `SELECT xyfir_id FROM users WHERE user_id = ?`;

            cn.query(sql, [token[0]], (err, rows) => {
                // User doesn't exist
                if (err || !rows.length) {
                    cn.release();
                    error();
                }
                // Validate access token with Xyfir Accounts
                else {
                    let url = config.addresses.xacc + "api/service/14/"
                    + `${config.keys.xacc}/${rows[0].xyfir_id}/${token[1]}`;

                    request(url, (err, response, body) => {
                        // Error in request
                        if (err) {
                            cn.release();
                            error();
                            return;
                        }

                        body = JSON.parse(body);

                        // Error from Xyfir Accounts
                        if (body.error) {
                            cn.release();
                            error();
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
            error();
        }
    });
    
};