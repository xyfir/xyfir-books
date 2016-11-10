const rewardAffiliate = require("lib/purchase/reward-affiliate");
const setSubscription = require("lib/purchase/set-subscription");
const rewardReferrer = require("lib/purchase/reward-referrer");
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

    const subs = {
        '1': { days: 30, months: 1, cost: 400 },
        '2': { days: 182, months: 6, cost: 2100 },
        '3': { days: 365, months: 12, cost: 3600 }
    };

    if (subs[req.body.subscription] === undefined) {
        res.json({ error: true, message: "Invalid subscription length" });
        return;
    }

    // Grab amount of extra gigabytes user has added to library size limit
    let sql = `
        SELECT
            library_size_limit - 15 as size, subscription, referral
        FROM users WHERE user_id = ?
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
            let amount = subs[req.body.subscription].cost + (
                (rows[0].size * 15) * subs[req.body.subscription].months
            );

            const referral = JSON.parse(rows[0].referral);

            // Discount 10% off of first purchase
            if ((referral.referral || referral.affiliate) && !referral.hasMadePurchase) {
                referral.hasMadePurchase = true;
                amount -= amount * 0.10;
            }

            // Build stripe data object
            const data = {
                amount, source: req.body.stripeToken, currency: "usd",
                description: `Libyq Subscription (${
                    subs[req.body.subscription].days
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
                const subscription = setSubscription(
                    rows[0].subscription, subs[req.body.subscription].days
                );

                // Update users.subscription|referral
                sql = `
                    UPDATE users SET subscription = ?, referral = ?
                    WHERE user_id = ?
                `, vars = [
                    subscription, JSON.stringify(referral), 
                    req.session.uid
                ];

                cn.query(sql, vars, (err, result) => {
                    // Reward referrer / affiliate
                    if (referral.referral) {
                        rewardReferrer(
                            cn, referral.referral,
                            subs[req.body.subscription].days
                        );
                    }
                    else if (referral.affiliate) {
                        cn.release();
                        rewardAffiliate(referral.affiliate, amount);
                    }
                    else {
                        cn.release();
                    }

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