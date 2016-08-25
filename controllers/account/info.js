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
    
    let sql = `
        SELECT
            library_size_limit as librarySizeLimit, subscription, library_id as library
        FROM users WHERE user_id = ?
    `;

    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();

        if (err || !rows.length)
            res.json({ library: "" });
        else
            res.json(rows[0]);
    }));
    
};