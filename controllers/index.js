const router = require('express').Router();

/* Library Manager */
router.post(
  '/library-manager/:lib/library',
  require('./library-manager/add-library')
);
router.post(
  '/library-manager/:lib/books',
  require('./library-manager/add-books')
);
router.put(
  '/library-manager/:lib/books/:book',
  require('./library-manager/increment-version')
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
router.post(
  '/books/:book/note',
  require('./books/note/remove')
);

/* Account */
router.get('/account', require('./account/info'));
router.post('/account/login', require('./account/login'));
router.get('/account/logout', require('./account/logout'));
router.put('/account/size-limit', require('./account/increase-size-limit'));
router.put('/account/subscription', require('./account/extend-subscription'));
router.post('/account/subscription', require('./account/purchase-subscription'));
router.post('/account/native-purchase', require('./account/native-purchase'));

module.exports = router;