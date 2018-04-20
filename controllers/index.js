const router = require('express').Router();

/* Account */
router.get('/account', require('./account/info'));
router.put('/account', require('./account/update'));
router.post('/account/login', require('./account/login'));
router.get('/account/logout', require('./account/logout'));

/* Account - Purchase */
router.post('/account/purchase', require('./account/purchase/start'));
router.get('/account/purchase', require('./account/purchase/finish'));

/* Books */
router.post('/books/email-upload', require('./books/email-upload'));

/* Version */
router.get('/version', require('./version'));

module.exports = router;
