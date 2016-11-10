module.exports = function(subscription, days) {
    
    return Date.now() > subscription
        ? (Date.now() + ((60 * 60 * 24 * days) * 1000))
        : (subscription + ((60 * 60 * 24 * days) * 1000));
    
}