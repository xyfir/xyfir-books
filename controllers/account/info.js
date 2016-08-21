/*
    GET api/account
    RETURN
        {
            subscription: number, library: string
        }
    DESCRIPTION
        Return account info
*/
module.exports = function(req, res) {
    
    res.json({
        subscription: req.session.subscription,
        library: req.session.library
    });
    
};