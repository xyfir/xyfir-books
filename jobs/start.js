"use strict";

const cron = require("cron");

/*
    Sets cronjobs to run at appropriate times
    Handles errors / responses from jobs
*/
module.exports = function() {
    var jobs = {
        deleteExpiredLibraries: require("./delete-expired-libraries")
    };

    // Delete libraries over a week expired
    // Runs twice a day
    // Retries once on failure
    new cron.CronJob("0 1/12 * * *", () => jobs.autobid(err => {
        if (err) jobs.autobid(err => { return; });
    }), () => { return; }, true);

};