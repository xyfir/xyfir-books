const package = require('package.json');

/*
  GET /api/version
  RETURN
    version: string
*/
module.exports = (req, res) => res.send(package.version);