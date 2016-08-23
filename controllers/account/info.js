const db = require("lib/db");

/*
    GET api/account
    RETURN
        {
            subscription:? number, library: string,
            librarySizeLimit?: number
        }
    DESCRIPTION
        Return account info
*/
module.exports = function(req, res) {
    
    let sql = "SELECT library_size_limit FROM users WHERE user_id = ?";

    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();

        if (err || !rows.length) {
            res.json({ library: "" });
        }
        else {
            res.json({
                librarySizeLimit: rows[0].library_size_limit,
                subscription: req.session.subscription,
                library: req.session.library
            });
        }
    }));
    
};