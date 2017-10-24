const setSubscription = require('lib/purchase/set-subscription');

/**
 * Rewards a user that referred another user who is currently making a 
 * purchase.
 * @async
 * @param {object} db - A connected instance of `lib/mysql`.
 * @param {number} uid
 */
module.exports = async function(db, uid) {

  const [user] = await db.query(
    'SELECT subscription FROM users WHERE user_id = ?',
    [uid]
  );

  if (!user) return;

  await db.query(
    'UPDATE users SET subscription = ? WHERE user_id = ?',
    [setSubscription(user.subscription, 30), uid]
  );

}