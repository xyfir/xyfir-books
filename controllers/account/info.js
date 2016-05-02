"use strict";

/*
    GET api/account
    RETURN
        {
            subscription: number, library: {
                address: string, id: string
            }
        }
    DESCRIPTION
        Return account info
*/
module.exports = function(req, res) {
    
    res.json({
        subscription: req.session.subscription, library: {
            address: req.session.library.address,
            id: req.session.library.id
        }
    });
    
};