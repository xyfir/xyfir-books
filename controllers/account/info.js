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

      library: string, subscription:? number, uid?: number, xadid?: string,
      librarySizeLimit?: number, email?: string,
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
    let sql, vars, rows, uid;

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
      sql = `
        SELECT xyfir_id FROM users WHERE user_id = ?
      `,
      vars = [
        token[0]
      ],
      rows = await db.query(sql, vars);

      if (!rows.length) throw 'User does not exist';

      // Validate access token with Xyfir Accounts
      const xyAccRes = await request
        .get(config.addresses.xyAccounts + 'api/service/14/user')
        .query({
          key: config.keys.xyAccounts, xid: rows[0].xyfir_id, token: token[1]
        });

      if (xyAccRes.body.error)
        throw 'xyAccounts error: ' + xyAccRes.body.message;
        
      uid = token[0];
    }
    // Get info for dev user
    else if (config.environment.type == 'dev') {
      uid = 1;
    }
    // Force login
    else {
      throw 'Access token required';
    }

    sql = `
      SELECT
        library_size_limit AS librarySizeLimit, subscription, email,
        library_id AS library, xad_id AS xadid, referral,
        user_id AS uid
      FROM users WHERE user_id = ?
    `,
    vars = [
      uid
    ],
    rows = await db.query(sql, vars);

    db.release();

    if (!rows.length) throw 'User does not exist';

    rows[0].referral = JSON.parse(rows[0].referral);

    // Set session, return account info
    rows[0].error = false,
    req.session.uid = uid,
    req.session.xadid = rows[0].xadid,
    req.session.library = rows[0].library,
    req.session.subscription = rows[0].subscription;
    
    res.json(rows[0]);
  }
  catch (err) {
    db.release();
    req.session.destroy(e => 
      res.json({ error: true, message: err, library: '' })
    );
  }
  
};