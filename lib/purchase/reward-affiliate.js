const request = require('superagent');
const config = require('config');

/**
 * Call xyAccounts to reward an affiliate.
 * @param {string} promoCode
 * @param {number} amount
 */
module.exports = function(promoCode, amount) {
  
  request
    .post(config.address.xyAccounts + 'api/affiliate/purchase')
    .send({
      service: 14, serviceKey: config.keys.xyAccounts,
      promoCode, amount
    })
    .end(() => 1);

}