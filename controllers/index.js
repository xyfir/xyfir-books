const router = require("express").Router();

/* Library Manager */

router.post("/library-manager/:server/:lib/library", require("./library-manager/add-library"));
router.post("/library-manager/:server/:lib/books", require("./library-manager/add-books"));
router.put("/library-manager/:server/:lib/books/:book", require("./library-manager/increment-version"));

/* Books */

router.route("/books")
    .get(require("./books/list"))
    .delete(require("./books/delete"));

router.get("/books/:book", require("./books/open"));
router.post("/books/:book/close", require("./books/close"));

router.route("/books/:book/bookmark")
    .post(require("./books/bookmark/add"))
    .delete(require("./books/bookmark/remove"));

router.route("/books/:book/note")
    .post(require("./books/note/add"))
    .delete(require("./books/note/remove"));
    
router.put("/books/:book/word-count", require("./books/word-count"));

/* Account */

router.get("/account", require("./account/info"));
router.post("/account/login", require("./account/login"));
router.put("/account/size-limit", require("./account/increase-size-limit"));
router.put("/account/subscription", require("./account/extend-subscription"));
router.post("/account/subscription", require("./account/purchase-subscription"));

module.exports = router;