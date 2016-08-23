const stripe = require("stripe");
const db = require("lib/db");

const config = require("config");

/*
    PUT api/account/size-limit
    REQUIRED
        stripeToken: string, limit: number
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Increase user's library storage size limit
        User is charged $0.15 for each added GB for each month left in subscription
*/
module.exports = function (req, res) {

    // Grab user's current library size limit
    let sql = `
        SELECT library_size_limit as limit FROM users WHERE user_id = ?
    `, vars = [
        req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            cn.release();
            res.json({ error: true, message: "Unknown error occured" });
        }
        else if (rows[0].limit >= req.body.limit) {
            cn.release();
            res.json({
                error: true,
                message: "New limit must be larger than previous limit"
            });
        }
        else {
            // Calculate months left in user's subscription (rounded up)
            // 1.2 months remaining -> charge for 2 months
            const amount = Math.ceil(
                (req.session.subscription - Date.now()) / 2592000000
            ) * ((req.body.limit - rows[0].limit) * 15);

            // Build stripe data object
            const data = {
                amount, source: req.body.stripeToken, currency: "usd",
                description: `Libyq - Increase Storage to ${
                    +req.body.limit
                } GB`
            };

            // Attempt to charge user's card
            stripe(config.keys.stripe).charges.create(data, (err, charge) => {
                if (err) {
                    res.json({
                        error: true,
                        message: "Error processing your card. Please try again."
                    }); return;
                }

                // Update users.library_size_limit
                sql = `
                    UPDATE users SET library_size_limit = ? WHERE user_id = ?
                `, vars = [
                    req.body.limit, req.session.uid
                ];

                cn.query(sql, vars, (err, result) => {
                    cn.release();

                    if (err || !result.affectedRows)
                        res.json({ error: true, message: "Contact support at libyq@xyfir.com" });
                    else
                        res.json({ error: false, message: "" });
                });
            });
        }
    }));

};