const request = require('superagent');
const moment = require('moment');
const CONFIG = require('config');
const MySQL = require('lib/mysql');

/**
 * `POST /api/account/purchase`
 * @param {object} req
 * @param {object} req.body
 * @param {string} req.body.type - 'normal|iap|swiftdemand'
 * @param {number} req.body.tier
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 * @prop {string} [url]
 */
module.exports = async function(req, res) {

  const db = new MySQL;

  try {
    await db.getConnection();
    const [user] = await db.query(`
      SELECT subscription, referral, email
      FROM users WHERE user_id = ?
    `, [
      req.session.uid
    ]);

    if (!user) throw 'Could not find account';

    const t = +req.body.tier || 1;
    const gb = (() => {
      switch (t) {
        case 1: return 1;
        case 2: return 10;
        case 3: return 15;
        default: return t * 5;
      }
    })();
    const methods = (() => {
      switch (req.body.type) {
        case 'iap': return ['iap'];
        case 'normal': return ['card', 'crypto'];
        case 'swiftdemand': return ['swiftdemand'];
      }
    })();
    const referral = JSON.parse(user.referral);
    const subscription = setSubscription(
      user.subscription, req.body.type == 'swiftdemand' ? 30 : 365
    );
    referral.hasMadePurchase = true;

    // Discount 5% off of first purchase
    const discount =
      (referral.user || referral.affiliate) &&
      !referral.hasMadePurchase

    /** @type {number} */
    let refUserSubscription;
    if (referral.user) {
      const [ru] = await db.query(
        'SELECT subscription FROM users WHERE user_id = ?', [referral.user]
      );
      if (ru) refUserSubscription = setSubscription(ru.subscription, 30);
    }
    db.release();

    const payment = await request
      .post(`${CONFIG.addresses.xyPayments}/api/payments`)
      .send({
        seller_id: CONFIG.ids.xyPayments.seller,
        seller_key: CONFIG.keys.xyPayments,
        product_id: req.body.type == 'swiftdemand'
          ? CONFIG.ids.xyPayments.products.threeMonthSwiftDemand
          : CONFIG.ids.xyPayments.products[`tier${t}`],
        methods,
        description: 'xyBooks Premium',
        info: {
          gb,
          user_id: req.session.uid,
          referral,
          subscription,
          refUserSubscription
        },
        email: user.email,
        redirect_url:
          `${CONFIG.addresses.xyBooks.root}api/account/purchase` +
          `?payment_id=PAYMENT_ID`,
        discount: discount ? 5 : null
      });

    res.status(200).json({ url: payment.body.url });
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }

};

/**
 * Adds days to the user's subscription.
 * @param {number} subscription
 * @param {number} days
 * @return {number}
 */
function setSubscription(subscription, days) {
  return Date.now() > subscription
    ? +moment().add(days, 'days').format('x')
    : +moment(subscription).add(days, 'days').format('x');
}