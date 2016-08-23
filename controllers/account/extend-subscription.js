const stripe = require("stripe");
const db = require("lib/db");

const config = require("config");

/*
    PUT api/account/subscription
    REQUIRED
        stripeToken: string, subscription: number
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Extend a user's subscription by 1|6|12 months
*/
module.exports = function (req, res) {

    const subscriptions = {
        '1': { days: 30, months: 1, cost: 400 },
        '2': { days: 182, months: 6, cost: 2100 },
        '3': { days: 365, months: 12, cost: 3600 }
    };

    if (subscriptions[req.body.subscription] === undefined) {
        res.json({ error: true, message: "Invalid subscription length" });
        return;
    }

    // Grab amount of extra gigabytes user has added to library size limit
    let sql = `
        SELECT library_size_limit - 15 as size FROM users WHERE user_id = ?
    `, vars = [
        req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            cn.release();
            res.json({ error: true, message: "Unknown error occured" });
        }
        else {
            // Calculate cost of subscription + added storage gigabytes
            const amount = subscriptions[req.body.subscription].cost + (
                (rows[0].size * 15) * subscriptions[req.body.subscription].months
            );

            // Build stripe data object
            const data = {
                amount, source: req.body.stripeToken, currency: "usd",
                description: `Libyq Subscription (${
                    subscriptions[req.body.subscription].days
                } Days)`
            };

            // Attempt to charge user's card
            stripe(config.keys.stripe).charges.create(data, (err, charge) => {
                if (err) {
                    res.json({
                        error: true,
                        message: "Error processing your card. Please try again."
                    }); return;
                }

                // Extend subscription expiration time
                const subscription = req.session.subscription
                    + (subscriptions[req.body.subscription].days * 86400000);

                // Update users.subscription
                sql = `
                    UPDATE users SET subscription = ? WHERE user_id = ?
                `, vars = [
                    subscription, req.session.uid
                ];

                cn.query(sql, vars, (err, result) => {
                    cn.release();

                    if (err || !result.affectedRows) {
                        res.json({ error: true, message: "Contact support at libyq@xyfir.com" });
                    }
                    else {
                        res.json({ error: false, message: "" });

                        req.session.subscription = subscription;
                    }
                });
            });
        }
    }));

};