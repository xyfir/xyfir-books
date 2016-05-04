"use strict";

const cron = require("cron");

/*
    Sets cronjobs to run at appropriate times
    Handles errors / responses from jobs
*/
module.exports = function() {
    
    const jobs = {
        deleteExpiredLibraries: require("./delete-expired-libraries")
    };

    // Delete libraries over a week expired
    // Runs twice a day
    // Retries once on failure
    new cron.CronJob("0 1/12 * * *", () => jobs.deleteExpiredLibraries(err => {
        if (err) jobs.deleteExpiredLibraries(err => { return; });
    }), () => { return; }, true);

};