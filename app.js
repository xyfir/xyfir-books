require("app-module-path").addPath(__dirname);

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

app.use("/static", express.static(__dirname + "/static"));
app.use("/api", require("./controllers/"));

app.get("/", (req, res) => {
    if (config.environment.type == "dev") {
        req.session.uid = 1;
        req.session.library = "1-testtesttesttesttesttesttesttesttesttest";
        req.session.subscription = Date.now() + (86400 * 30 * 1000);
    }
    res.sendFile(__dirname + "/views/Home.html");
});
app.get("/app/*", (req, res) => res.sendFile(__dirname + "/views/App.html"));
app.listen(config.environment.port, () => {
    console.log("~~Server running on port", config.environment.port);
});

if (config.environment.runCronJobs)
    require("./jobs/start")();