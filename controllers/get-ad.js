const request = require('superagent');
const config = require('config');

/*
  GET api/ad
  REQUIRED
    content: string
  RETURN
    {
      error: boolean, message:? string,
      ad?: {
        title: string, link: string, description: string
      }
    }
  DESCRIPTION
    Loads an ad from xyAds
*/
module.exports = async function(req, res) { 

  try {
    const result = await request
      .get(config.addresses.xyAds)
      .query({
        pubid: 4, types: '1,2', count: 1,
        content: req.body.content, ip: req.ip
      });

    if (!result.body.ads.length) throw 'No ads found';

    res.json({ error: false, ad: result.body.ads[0] });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};