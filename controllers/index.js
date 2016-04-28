"use strict";

const router = require("express").Router();

/* Library Manager */

router.post("/library-manager/:server/:lib/library", require("./library-manager/add-library"));
router.post("/library-manager/:server/:lib/books", require("./library-manager/add-books"));
router.put("/library-manager/:server/space", require("./library-manager/update-freespace"));

module.exports = router;