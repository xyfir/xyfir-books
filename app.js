"use strict";

const express = require("express");
const parser = require("body-parser");
const app = express();

app.listen(process.env.port, () => {
    console.log("SERVER RUNNING ON", process.env.port);
});

app.use("/", express.static(__dirname + "/public"));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use("/api", require("./controllers/"));