const rewardAffiliate = require('lib/purchase/reward-affiliate');
const setSubscription = require('lib/purchase/set-subscription');
const rewardReferrer = require('lib/purchase/reward-referrer');
const rstring = require('randomstring');
const request = require('superagent');
const config = require('config');
const stripe = require('stripe');
const mysql = require('lib/mysql');

/*
  POST api/account/purchase/stripe
  REQUIRED
    token: string
  RETURN
    { error: boolean, message: string }
  DESCRIPTION
    Allows user to purchase or extend a subscription using Stripe
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    let [user] = await db.query(
      'SELECT subscription, library_id, referral FROM users WHERE user_id = ?',
      [req.session.uid]
    );

    if (!user) throw 'Could not find account';

    let create = false, library = user.library_id;

    if (!library) {
      create = true,
      library = req.session.uid + '-' + rstring.generate(64);
    }

    let amount = 2500;

    const ref = JSON.parse(user.referral);

    // Discount 10% off of first purchase
    if ((ref.referral || ref.affiliate) && !ref.hasMadePurchase) {
      ref.hasMadePurchase = true;
      amount -= amount * 0.10;
    }

    await stripe(config.keys.stripe).charges.create({
      amount, source: req.body.token, currency: 'usd',
      description: 'Xyfir Books Subscription'
    });

    const subscription = setSubscription(user.subscription, 365);

    await db.query(`
      UPDATE users SET
        subscription = ?, referral = ?,
        library_id = ?, library_size_limit = ?
      WHERE user_id = ?
    `, [
      subscription, JSON.stringify(ref),
      library, 15,
      req.session.uid
    ]);

    if (ref.referral)
      await rewardReferrer(db, ref.referral);
    else if (ref.affiliate)
      rewardAffiliate(ref.affiliate, amount);

    db.release();

    if (create) {
      const xyLibRes = await request
        .post(config.addresses.library + 'libraries/' + library);
    }

    req.session.library = library,
    req.session.subscription = subscription;

    res.json({ error: false, message: '' });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};