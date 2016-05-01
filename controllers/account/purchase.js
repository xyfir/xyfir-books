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
            SELECT subscription FROM users WHERE user_id = ?
        `;
        db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
            if (err || !rows.length) {
                cn.release();
                res.json({ error: true, message: "An unknown error occured" });
            }
            else {
                // Add months to current subscription expiration (or now())
                let subscription = rows[0].subscription == 0
                    ? (Date.now() + (subscriptions[req.body.subscription].days * 86400 * 1000))
                    : (rows[0].subscription + (subscriptions[req.body.subscription].days * 86400 * 1000));

                sql = `
                    UPDATE users SET subscription = ? WHERE user_id = ?
                `;
                cn.query(sql, [subscription, req.session.uid], (err, result) => {
                    cn.release();
                    
                    req.session.subscription = subscription;
                    res.json({ error: false, message: "" });
                });
            }
        }));
    });

};