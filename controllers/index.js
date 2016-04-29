"use strict";

const router = require("express").Router();

/* Library Manager */
router.post("/library-manager/:server/:lib/library", require("./library-manager/add-library"));
router.post("/library-manager/:server/:lib/books", require("./library-manager/add-books"));
router.post("/library-manager/:server/space", require("./library-manager/space-needed"));
router.put("/library-manager/:server/space", require("./library-manager/update-freespace"));

/* Books */
router.route("/books")
    .get(require("./books/list"))
    .delete(require("./books/delete"));
router.route("/books/:book")
    .get(require("./books/info"))
    .put(require("./books/increment-version"));

/* Account */
router.get("/account", require("./account/info"));
router.put("/account/subscription", require("./account/purchase"));
router.post("/account/login", require("./account/login"));

module.exports = router;