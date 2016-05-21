"use strict";

const express = require("express");
const session = require("express-session");
const parser = require("body-parser");
const app = express();

const sstore = require("express-mysql-session");
const config = require("./config");

/* Sessions */
const sessionStore = new sstore({
    host: config.database.mysql.host,
    port: config.database.mysql.port,
    user: config.database.mysql.user,
    password: config.database.mysql.password,
    database: config.database.mysql.database,
    useConnectionPooling: true
});
app.use(session({
    secret: config.secrets.session,
    store: sessionStore,
    saveUninitialized: true,
    resave: true,
    cookie: {
        httpOnly: false
    }
}));

/* Body Parser */
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use("/", express.static(__dirname + "/public"));
app.use("/api", require("./controllers/"));

app.get("/", (req, res) => {
    if (config.environment.type == "dev") {
        req.session.uid = 1; req.session.subscription = 0;
        req.session.library = {
            address: "http://localhost:2085/", server: 1,
            id: "1-libliblililibliblililibliblililibliblili"
        };
    }
    res.sendFile(__dirname + "/views/Home.html");
});
app.get("/app/*", (req, res) => res.sendFile(__dirname + "/views/App.html"));
app.listen(config.environment.port, () => {
    console.log("SERVER RUNNING ON", config.environment.port);
});

if (config.environment.runCronJobs)
    require("./jobs/start")();