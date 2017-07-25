const rewardAffiliate = require('lib/purchase/reward-affiliate');
const setSubscription = require('lib/purchase/set-subscription');
const rewardReferrer = require('lib/purchase/reward-referrer');
const randString = require('randomstring');
const request = require('request');
const stripe = require('stripe');
const db = require('lib/db');

const config = require('config');

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

  const subs = {
    '1': { days: 30, months: 1, cost: 640 },
    '2': { days: 182, months: 6, cost: 2100 },
    '3': { days: 365, months: 12, cost: 3600 }
  };

  if (subs[req.body.subscription] === undefined) {
    res.json({ error: true, message: 'Invalid subscription length' });
    return;
  }

  let sql = `
    SELECT subscription, library_id, referral FROM users WHERE user_id = ?
  `,
  vars = [
    req.session.uid
  ];

  db(cn => cn.query(sql, vars, (err, rows) => {
    let error = '', createLibrary = true, library = '';

    if (err || !rows.length)
      error = 'An unknown error occured';
    else if (rows[0].subscription > Date.now())
      error = 'You already have a subscription';
    else if (rows[0].library_id)
      createLibrary = false, library = rows[0].library_id;

    if (error) {
      cn.release();
      res.json({ error: true, message: error });
      return;
    }

    // Calculate cost of subscription + added storage gigabytes
    let amount = subs[req.body.subscription].cost +
      ((+req.body.addToSizeLimit * 15) * subs[req.body.subscription].months);

    const referral = JSON.parse(rows[0].referral);

    // Discount 10% off of first purchase
    if ((referral.referral || referral.affiliate) && !referral.hasMadePurchase) {
      referral.hasMadePurchase = true;
      amount -= amount * 0.10;
    }

    // Build stripe data object
    const data = {
      amount, source: req.body.stripeToken, currency: 'usd',
      description: `Xyfir Books Subscription (${
        subs[req.body.subscription].days
      } Days)`
    };

    // Attempt to charge user's card
    stripe(config.keys.stripe).charges.create(data, (err, charge) => {
      if (err) {
        return res.json({
          error: true,
          message: 'Error processing your card. Please try again.'
        });
      }

      // Set subscription expiration Date
      const subscription = setSubscription(
        0, subs[req.body.subscription].days
      );
      
      // Generate library id
      if (createLibrary)
        library = req.session.uid + '-' + randString.generate(64);

      // Set users.subscription|library_id|library_size_limit|referral
      sql = `
        UPDATE users SET
          subscription = ?, referral = ?, library_id = ?,
          library_size_limit = ?
        WHERE user_id = ?
      `,
      vars = [
        subscription, JSON.stringify(referral), library,
        (15 + +req.body.addToSizeLimit),
        req.session.uid
      ];

      cn.query(sql, vars, (err, result) => {
        // Reward referrer / affiliate
        if (referral.referral) {
          rewardReferrer(
            cn, referral.referral, subs[req.body.subscription].days
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
          res.json({
            error: true, message: 'Contact support at books@xyfir.com'
          });
        }
        else if (createLibrary) {
          request.post({
            url: config.addresses.library + 'libraries/' + library
          }, (err, response, body) => {
            if (err || JSON.parse(body).error) {
              res.json({
                error: true,
                message: 'Contact support at books@xyfir.com'
              });
            }
            else {
              res.json({ error: false, message: '' });
              req.session.library = library;
              req.session.subscription = subscription;
            }
          });
        }
        else {
          res.json({ error: false, message: '' });
          req.session.subscription = subscription;
        }
      });
    });
  }));

};