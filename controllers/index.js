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
router.get(
  '/books',
  require('./books/list')
);
router.delete(
  '/books',
  require('./books/delete')
);
router.post(
  '/books/email-upload',
  require('./books/email-upload')
);
router.get(
  '/books/:book',
  require('./books/open')
);
router.post(
  '/books/:book/close',
  require('./books/close')
);
router.post(
  '/books/:book/bookmark',
  require('./books/bookmark/add')
);
router.delete(
  '/books/:book/bookmark',
  require('./books/bookmark/remove')
);
router.put(
  '/books/:book/word-count',
  require('./books/word-count')
);
router.post(
  '/books/:book/note',
  require('./books/note/add')
);
router.delete(
  '/books/:book/note',
  require('./books/note/remove')
);

/* Version */
router.get('/version', require('./version'));

module.exports = router;