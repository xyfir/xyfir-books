const enforceLibrarySizeLimit = require('jobs/cron/enforce-library-size-limit');
const deleteExpiredLibraries = require('jobs/cron/delete-expired-libraries');

module.exports = function() {

    // Delete libraries over a week expired
    // Runs twice a day
    setInterval(deleteExpiredLibraries, 43200 * 1000);

    // Enforce library size limits
    // Run once a day
    setInterval(enforceLibrarySizeLimit, 86400 * 1000);

};