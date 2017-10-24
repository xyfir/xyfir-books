const moment = require('moment');

/**
 * Adds days to the user's subscription.
 * @param {number} subscription
 * @param {number} days
 * @return {number}
 */
module.exports = function(subscription, days) {

  return Date.now() > subscription
    ? +moment().add(days, 'days').format('x')
    : +moment(subscription).add(days, 'days').format('x');

}