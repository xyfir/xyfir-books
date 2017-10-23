const request = require('superagent');
const crypto = require('lib/crypto');
const moment = require('moment');
const mysql = require('lib/mysql');

const config = require('config');

/*
  POST api/account/purchase/swiftdemand
  REQUIRED
    BODY
      swiftId: string
    OR
      BODY
        id: number, uuid: string, product_id: number, sender_swift_name: string,
        swifts: number, status: string, callback_url: string, redirect_url: string,
        created_at: string, updated_at: string
      QUERY
        data: encrypted-json-string {
          user_id: number
        }
  RETURN
    { error: boolean, message?: string, redirect?: string }
    OR
    HTTP STATUS 200
  DESCRIPTION
    Initiate the process of making a SwiftDemand payment
    OR
    Handle a completed SwiftDemand payment
*/
module.exports = async function(req, res) {

  const db = new mysql, {body, query} = req;

  try {
    if (body.swiftId) {
      const sdRes = await request
        .post(config.addresses.swiftDemand + 'api/v0/payments')
        .send({
          product_id: config.ids.swiftDemandProduct,
          redirect_url: config.addresses.xyBooks.root + 'app/#account',
          callback_url:
            config.addresses.xyBooks.callback +
            'api/account/purchase/swiftdemand?data=' + 
            crypto.encrypt(
              JSON.stringify({ user_id: req.session.uid }),
              config.keys.swiftDemand
            ),
          sender_swift_name: body.swiftId
        });

      res.json({ error: false, redirect: sdRes.body.link });
    }
    else {
      if (body.status != 'paid') throw 'Invalid status';

      const referral = JSON.stringify({
        referral: 'SWIFTDEMAND',
        hasMadePurchase: false
      }),
      info = JSON.parse(
        crypto.decrypt(query.data, config.keys.swiftDemand)
      );

      await db.getConnection();
      await db.query(`
        UPDATE users
        SET subscription = ?, referral = ?
        WHERE user_id = ? AND referral = ?
      `, [
        +moment().add(90, 'days').format('x'), '{}',
        info.user_id, referral
      ]);
      db.release();

      res.status(200).send();
    }
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};