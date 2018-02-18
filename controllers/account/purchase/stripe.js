const rewardAffiliate = require('lib/purchase/reward-affiliate');
const setSubscription = require('lib/purchase/set-subscription');
const rewardReferrer = require('lib/purchase/reward-referrer');
const rstring = require('randomstring');
const request = require('superagent');
const config = require('config');
const stripe = require('stripe');
const MySQL = require('lib/mysql');

/*
  POST api/account/purchase/stripe
  REQUIRED
    token: string, tier: number
  RETURN
    { error: boolean, message: string }
  DESCRIPTION
    Allows user to purchase or extend a subscription using Stripe
*/
module.exports = async function(req, res) {

  const db = new MySQL;

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

    let tier = +req.body.tier || 1;
    tier = (() => {
      switch (+req.body.tier) {
        case 1: return { gb: 1, price: 500 };
        case 2: return { gb: 10, price: 1500 };
        case 3: return { gb: 15, price: 2000 };
        default: return {
          gb: tier * 5, price: (20 + ((tier - 3) * 7)) * 100
        };
      }
    })();

    const ref = JSON.parse(user.referral);

    // Discount 10% off of first purchase
    if ((ref.user || ref.affiliate) && !ref.hasMadePurchase) {
      ref.hasMadePurchase = true;
      tier.price -= tier.price * 0.10;
    }

    await stripe(config.keys.stripe).charges.create({
      amount: tier.price, source: req.body.token, currency: 'usd',
      description: 'xyBooks Premium Subscription'
    });

    const subscription = setSubscription(user.subscription, 365);

    await db.query(`
      UPDATE users SET
        subscription = ?, referral = ?,
        library_id = ?, library_size_limit = ?
      WHERE user_id = ?
    `, [
      subscription, JSON.stringify(ref),
      library, tier.gb,
      req.session.uid
    ]);

    if (ref.user)
      await rewardReferrer(db, ref.user);
    else if (ref.affiliate)
      rewardAffiliate(ref.affiliate, tier.price);

    db.release();

    if (create) {
      await request.post(`${config.addresses.library}libraries/${library}`);
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