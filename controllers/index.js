const router = require('express').Router();

/* Account */
router.get(
  '/account',
  require('./account/info')
);
router.put(
  '/account',
  require('./account/update')
);
router.post(
  '/account/login',
  require('./account/login')
);
router.get(
  '/account/logout',
  require('./account/logout')
);

/* Advertisements */
router.get('/ad', require('./get-ad'));

/* Account - Purchase */
router.post(
  '/account/purchase/stripe',
  require('./account/purchase/stripe')
);
router.post(
  '/account/purchase/swiftdemand',
  require('./account/purchase/swiftdemand')
);

/* Books */
router.post(
  '/books/email-upload',
  require('./books/email-upload')
);

/* Version */
router.get('/version', require('./version'));

module.exports = router;