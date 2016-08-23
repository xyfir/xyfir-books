const randString = require("randomstring");
const request = require("request");
const stripe = require("stripe");
const db = require("lib/db");

const config = require("config");

/*
    POST api/account/subscription
    REQUIRED
        stripeToken: string, subscription: number, addToSizeLimit: number
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Subscribe user to service
        Generates and creates library
*/
module.exports = function (req, res) {

    const subscriptions = {
        '1': { days: 30, cost: 400 },
        '2': { days: 182, cost: 2100 },
        '3': { days: 365, cost: 3600 }
    };

    if (subscriptions[req.body.subscription] === undefined) {
        res.json({ error: true, message: "Invalid subscription length" });
        return;
    }

    // Calculate cost of subscription + added storage gigabytes
    const amount = subscriptions[req.body.subscription].cost
        + (req.body.addToSizeLimit * 15);

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

        // Set subscription expiration Date
        const subscription = Date.now()
            + (subscriptions[req.body.subscription].days * 86400000);
        
        // Generate library id
        const library = req.session.uid + '-' + randString.generate(40);

        // Set users.subscription|library_id|library_size_limit
        let sql = `
            UPDATE users SET subscription = ?, library_id = ?, library_size_limit = ?
            WHERE user_id = ?
        `, vars = [
            subscription, library, 15 + req.body.addToSizeLimit,
            req.session.uid
        ];

        db(cn => cn.query(sql, vars, (err, result) => {
            cn.release();

            if (err || !result.affectedRows) {
                res.json({ error: true, message: "Contact support at libyq@xyfir.com" });
            }
            else {
                // Create library
                request.post(config.addresses.library + library, (err, response, body) => {
                    if (err || JSON.parse(body).error) {
                        res.json({ error: true, message: "Contact support at libyq@xyfir.com" });
                    }
                    else {
                        res.json({ error: false, message: "" });

                        req.session.library = library;
                        req.session.subscription = subscription;
                    }
                });
            }
        }));
    });

};