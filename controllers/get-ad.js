const xyfirAds = require('xyfir-ads');

/*
  GET api/ad
  OPTIONAL
    content: string // ignored for now
  RETURN
    https://github.com/Xyfir/Ads/blob/master/ads.json
    XyfirAds[i]
*/
module.exports = async function(req, res) {

  const ads = await xyfirAds({ blacklist: ['xyBooks'] });

  if (!ads.length)
    res.json({});
  else
    res.json(ads[0]);

}