const enforceLibrarySizeLimit = require('jobs/cron/enforce-library-size-limit');

module.exports = function() {

  // Enforce library size limits
  // Run once a day
  setInterval(enforceLibrarySizeLimit, 86400 * 1000);

};