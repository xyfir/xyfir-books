const request = require("request");
const config = require("config");

module.exports = function(aff, amount) {
    
    request.post({
        url: config.address.xacc + "api/affiliate/purchase", form: {
            service: 14, serviceKey: config.keys.xacc,
            promoCode: aff, amount
        }
    }, (err, response, body) => 1);

}