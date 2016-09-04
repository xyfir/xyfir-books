const sendEmail = require("lib/send-email")
const request = require("request");
const db = require("lib/db");

const config = require("config");

/*
    Get size of all libraries
    Notify owners of libraries over size limit
    Delete libraries that have been over size limit for a week
*/
module.exports = function(fn) {

    let sql = `
        SELECT
            user_id, email, library_id, library_size_limit, library_delete
        FROM users
        WHERE library_id NOT ''
    `;

    db(cn => cn.query(sql, (err, rows) => {
        // Release temporarily while getting sizes
        cn.release();

        if (err) {
            fn(true);
        }
        else if (!rows.length) {
            fn(false);
        }
        else {
            const doUpdates = (cn, index) => {
                if (rows[index] === undefined) {
                    fn(false);
                }
                else if (rows[index].ok) {
                    // users.library_delete must be cleared 
                    if (rows[index].library_delete.indexOf("0") != 0) {
                        sql = "UPDATE users SET library_delete = '0' WHERE user_id = ?";
                        cn.query(sql, [rows[index].user_id], (e, r) => {
                            doUpdates(cn, index + 1);
                        });
                    }
                    else {
                        doUpdates(cn, index + 1);
                    }
                }
                else if (rows[index].notify) {
                    // Email user about reaching limit
                    const message = `
                        Your library has reached the size limit of '${rows[index].library_size_limit} GB'.
                        
                        You have two options to resolve this issue:
                        - Increase your library's size limit for $0.15 per gigabyte at https://libyq.com/app/#account/purchase/increase-size-limit
                        - Decrease your library's size by removing books, additional formats, etc

                        If you do not act to increase your size limit or decrease your library size your entire library will be deleted seven days after first reaching the limit. This action cannot be undone and your files will not be retrievable.
                    `;
                    sendEmail(
                        rows[index].email,
                        "Libyq - Library Size Limit Reached",
                        message
                    );
                    
                    // Library's first time going over limit: set library_delete
                    if (rows[index].library_delete.indexOf("0") == 0) {
                        // Set users.library_delete
                        sql = `
                            UPDATE users SET library_delete = DATE_ADD(NOW(), INTERVAL 7 DAY)
                            WHERE user_id = ?
                        `;
                        cn.query(sql, [rows[index].user_id], (e, r) => {
                            doUpdates(cn, index + 1);
                        });
                    }
                    else {
                        doUpdates(cn, index + 1);
                    }
                }
                else if (rows[index].deleteLibrary) {
                    // Delete library
                    request.delete({
                        url: config.addresses.library + rows[index].library_id,
                        success: (res) => {
                            if (!res.error) {
                                doUpdates(cn, index + 1);

                                // Notify user that their library was deleted
                                const message = `
                                    Your Libyq library has been deleted.

                                    This occured because your library was at or over the size limit for over 7 days.

                                    This action cannot be undone.
                                `;

                                sendEmail(
                                    rows[index].email,
                                    "Libyq - Library Deleted",
                                    message
                                );
                            }
                            else {
                                doUpdates(cn, index + 1);
                            }
                        }
                    });
                }
            };

            const getLibrarySize = (index) => {
                // All libraries checked
                if (rows[index] === undefined) {
                    db(cn => doUpdates(cn, 0));
                    return;
                }

                request({
                    url: config.addresses.library + rows[index].library_id + "/size",
                    success: (res) => {
                        if (!res.error) {
                            // Library is at or over limit
                            if (res.size / 1000000000 >= rows[index].library_size_limit) {
                                // Library has been over limit for 7+ days
                                if (Date.now() >= (new Date(rows[index].library_delete)).getTime()) {
                                    rows[index].deleteLibrary = true;
                                }
                                // Notify user that they're over limit
                                else {
                                    rows[index].notify = true;
                                }
                            }
                            // Library is under limit
                            else {
                                rows[index].ok = true;
                            }
                        }

                        getLibrarySize(index + 1);
                    }
                });
            };

            getLibrarySize(0);
        }
    }));

};