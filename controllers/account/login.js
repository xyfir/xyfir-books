const rstring = require('randomstring');
const request = require('superagent');
const moment = require('moment');
const crypto = require('lib/crypto');
const MySQL = require('lib/mysql');

const config = require('config');

/*
  POST api/account/login
  REQUIRED
    xid: string, auth: string
  OPTIONAL
    referral: object
  RETURN
    { error: boolean, message?: string, accessToken?: string }
  DESCRIPTION
    Register or login user
    Create a library for new users
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const xyAccRes = await request
      .get(config.addresses.xyAccounts + 'api/service/14/user')
      .query({
        key: config.keys.xyAccounts,
        xid: req.body.xid,
        token: req.body.auth
      });

    if (xyAccRes.body.error) throw 'xyAccounts error: ' + xyAccRes.body.message;

    await db.getConnection();

    let result,
      sql = `
      SELECT user_id, subscription FROM users WHERE xyfir_id = ?
    `,
      vars = [req.body.xid],
      rows = await db.query(sql, vars);

    // Register user
    if (!rows.length) {
      result = await db.query('INSERT INTO users SET ?', {
        xyfir_id: req.body.xid,
        email: xyAccRes.body.email,
        referral: '{}'
      });

      if (!result.insertId) throw 'Could not create account';

      req.session.uid = result.insertId;

      // Generate user's library id
      const library = result.insertId + '-' + rstring.generate(64);

      // Create library on xyLibrary
      const xyLibRes = await request.post(
        config.addresses.library + 'libraries/' + library
      );

      if (xyLibRes.body.error) throw 'Could not create new library';

      let subscription = 0,
        xyAnnotationsKey = '';
      const referral = req.body.referral || {};

      // Errors here are acceptable and can be ignored
      try {
        // Save referral data
        if (referral.user) {
          subscription = +moment()
            .add(7, 'days')
            .format('x');
        }
        // Validate affiliate promo code
        else if (referral.promo) {
          const xyAccAffRes = await request
            .post(config.address.xyAccounts + 'api/affiliate/signup')
            .send({
              service: 14,
              serviceKey: config.keys.xyAccounts,
              promoCode: referral.promo
            });

          if (!xyAccAffRes.body.error && xyAccAffRes.body.promo == 5) {
            subscription = +moment()
              .add(7, 'days')
              .format('x');
          }
        }

        // Generate a free one month subscription for xyAnnotations
        const xyAnnotationsRes = await request
          .post(config.addresses.xyAnnotations + 'api/affiliate/subscriptions')
          .send({
            days: 30,
            subscription: 1,
            affiliateId: config.ids.xyAnnotations,
            affiliateKey: config.keys.xyAnnotations
          });
        xyAnnotationsKey = xyAnnotationsRes.body.key || '';
      } catch (err) {
        console.warn('controllers/account/login', err);
      }

      // Save data to user's row
      (sql = `
        UPDATE users SET
          library_id = ?, referral = ?, xyannotations_key = ?, subscription = ?
        WHERE user_id = ?
      `),
        (vars = [
          library,
          JSON.stringify(referral),
          xyAnnotationsKey,
          subscription,
          req.session.uid
        ]),
        (result = await db.query(sql, vars));

      db.release();

      res.json({
        error: false,
        accessToken: crypto.encrypt(
          req.session.uid + '-' + xyAccRes.body.accessToken,
          config.keys.accessToken
        )
      });

      (req.session.subscription = 0), (req.session.library = library);
    }
    // Update user
    else {
      (sql = `
        UPDATE users SET email = ? WHERE user_id = ?
      `),
        (vars = [xyAccRes.body.email, rows[0].user_id]),
        (result = await db.query(sql, vars));

      db.release();

      (req.session.uid = rows[0].user_id),
        (req.session.subscription = rows[0].subscription);

      res.json({
        error: false,
        accessToken: crypto.encrypt(
          req.session.uid + '-' + xyAccRes.body.accessToken,
          config.keys.accessToken
        )
      });
    }
  } catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
};
