const enforceLibrarySizeLimit = require('jobs/cron/enforce-library-size-limit');
const wipeInactiveLibraries = require('jobs/cron/wipe-inactive-libraries');
const expireSubscriptions = require('jobs/cron/expire-subscriptions');

module.exports = function() {

  // Run once a day
  setInterval(enforceLibrarySizeLimit, 86400 * 1000);

  // Run once a day
  setInterval(wipeInactiveLibraries, 86400 * 1000);

  // Run once a day
  setInterval(expireSubscriptions, 86400 * 1000);

};