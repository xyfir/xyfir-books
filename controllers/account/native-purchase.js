const setSubscription = require('lib/purchase/set-subscription');
const randString = require('randomstring');
const request = require('request');
const iap = require('in-app-purchase');
const db = require('lib/db');

const config = require('config');

function applySubscriptions(req, res, purchases) {
  const subscriptions = {
    'com.xyfir.books.premium.30days': 30,
    'com.xyfir.books.premium.182days': 182,
    'com.xyfir.books.premium.365days': 365,
    'com.xyfir.books.premium.30': 30,
    'com.xyfir.books.premium.182': 182,
    'com.xyfir.books.premium.365': 365
  };

  let sql  = 'SELECT subscription, library_id FROM users WHERE user_id = ?',
  vars = [req.session.uid];

  db(cn => cn.query(sql, vars, (err, rows) => {
    try {
      if (err || !rows.length) throw 'Please contact support';

      let subscription = rows[0].subscription;

      // Get subscription time from product id
      // Update subscription expiration date
      purchases.forEach(purchase => {
        subscription = setSubscription(
          subscription, subscriptions[purchase.productId] || 0
        );
      });

      // Generate new library id if needed
      const generateLibrary = !rows[0].library_id;
      const library = generateLibrary
        ? req.session.uid + '-' + randString.generate(40)
        : rows[0].library_id;

      const updateUser = () => {
        // Apply new subscription expiration date / library id
        // to user's account
        sql = `
          UPDATE users SET subscription = ?, library_id = ?
          WHERE user_id = ?
        `, vars = [
          subscription, library, req.session.uid
        ];

        cn.query(sql, vars, (err, response) => {
          if (err || !response.affectedRows)
            throw 'Please contact support';

          cn.release();
          
          req.session.library = library;
          req.session.subscription = subscription;
          
          res.json({ error: false });
        });
      }

      // Generate library id if user does not have a library
      if (generateLibrary) {
        request.post({
          url: config.addresses.library + library
        }, (err, response, body) => {
          if (err || JSON.parse(body).error)
            throw 'Contact support at books@xyfir.com';
          else
            updateUser();
        });
      }
      else updateUser();
    }
    catch (e) {
      cn.release();
      res.json({ error: true, message: e });
    }
  }));
}

/*
  POST api/account/native-purchase
  REQUIRED
    transactionId, receipt, signature, productType
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Validate purchase recepit and add months to user's subscription
*/
module.exports = function(req, res) {

  req.body.data = JSON.parse(req.body.data);
  let data;

  // Signature property is empty string if from Apple
  const store = !req.body.data.signature
    ? iap.APPLE : iap.GOOGLE;

  // Set data to validate
  if (store == iap.APPLE) {
    data = req.body.data.receipt;
  }
  else {
    if (config.environment.type == 'prod') {
      iap.config({
        googlePublicKeyStrLive: config.keys.playStore
      });
    }
    else {
      iap.config({
        googlePublicKeyStrSandBox: config.keys.playStore
      });
    }

    data = {
      receipt: req.body.data.receipt, signature: req.body.data.signature
    };
  }

  // Validate receipt
  try {
    iap.setup(err => {
      if (err) throw 'Could not validate purchase';

      iap.validate(store, data, (err, response) => {
        if (err)
          throw 'Could not validate purchase';
        if (!iap.isValidated(response))
          throw 'Invalid purchase receipt received';
        
        applySubscriptions(req, res, iap.getPurchaseData(response));
      });
    });
  }
  catch (e) {
    res.json({ error: true, message: e });
  }

};