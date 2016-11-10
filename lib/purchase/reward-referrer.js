const setSubscription = require("./set-subscription");

module.exports = function(cn, ref, days) {
    
    let sql = `
        SELECT subscription FROM users WHERE user_id = ?
    `, vars = [ref];

    cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            cn.release();
        }
        else {
            sql = `
                UPDATE users SET subscription = ? WHERE user_id = ?
            `, vars = [
                setSubscription(rows[0].subscription, (days / 30) * 7 ), ref
            ];

            cn.query(sql, vars, (err, result) => cn.release());
        }
    });

}