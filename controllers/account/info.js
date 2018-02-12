const request = require('superagent');
const crypto = require('lib/crypto');
const mysql = require('lib/mysql');

const config = require('config');

/*
  GET api/account
  REQUIRED
    token: string
  RETURN
    {
      error: boolean, message?: string,

      library: string, subscription:? number, uid?: number, email?: string,
      librarySizeLimit?: number, xyAnnotationsKey?: string,
      referral?: {
        referral?: number, affiliate?: string,
        hasMadePurchase?: boolean
      }
    }
  DESCRIPTION
    Creates a new session using access token
    Return account info
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    let uid;

    await db.getConnection();

    // Validate access token
    if (req.query.token) {
      // [user_id, access_token]
      const token = crypto.decrypt(
        req.query.token, config.keys.accessToken
      ).split('-');

      // Invalid token
      if (!token[0] || !token[1]) throw 'Invalid access token';

      // Get user's Xyfir ID
      const [row] = await db.query(
        'SELECT xyfir_id FROM users WHERE user_id = ?',
        [token[0]]
      );

      if (!row) throw 'User does not exist';

      // Validate access token with Xyfir Accounts
      const xyAccRes = await request
        .get(config.addresses.xyAccounts + 'api/service/14/user')
        .query({
          key: config.keys.xyAccounts, xid: row.xyfir_id, token: token[1]
        });

      if (xyAccRes.body.error)
        throw 'xyAccounts error: ' + xyAccRes.body.message;

      uid = +token[0];
    }
    // Get info for dev user
    else if (config.environment.type == 'dev') {
      uid = 1;
    }
    // Force login
    else {
      throw 'Access token required';
    }

    const [row] = await db.query(`
      SELECT
        library_size_limit AS librarySizeLimit, subscription, email,
        user_id AS uid, xyannotations_key AS xyAnnotationsKey,
        library_id AS library, referral
      FROM users WHERE user_id = ?
    `, [
      uid
    ]);

    if (!row) throw 'User does not exist';

    await db.query(`
      UPDATE users SET last_active = NOW(), library_wiped = 0
      WHERE user_id = ?
    `, [
      uid
    ]);
    db.release();

    row.referral = JSON.parse(row.referral);

    // Set session, return account info
    row.error = false,
    req.session.uid = uid,
    req.session.library = row.library,
    req.session.subscription = row.subscription;

    res.json(row);
  }
  catch (err) {
    db.release();
    req.session.destroy(e =>
      res.json({ error: true, message: err, library: '' })
    );
  }

};