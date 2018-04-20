const config = require('config');

/*
  GET api/account/logout
  DESCRIPTION
    Destroy user's session
*/
module.exports = function(req, res) {
  req.session.destroy(err => res.redirect(config.addresses.xyBooks.root));
};
