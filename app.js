require('app-module-path').addPath(__dirname);

const SessionStore = require('express-mysql-session');
const express = require('express');
const session = require('express-session');
const parser = require('body-parser');
const moment = require('moment');
const app = express();

const config = require('./config');

app.use(
  session({
    saveUninitialized: true,
    secret: config.keys.session,
    store: SessionStore({
      useConnectionPooling: true,
      password: config.database.mysql.password,
      database: config.database.mysql.database,
      host: config.database.mysql.host,
      port: config.database.mysql.port,
      user: config.database.mysql.user
    }),
    resave: true,
    cookie: {
      httpOnly: false
    }
  })
);

app.use(parser.json({ limit: '5mb' }));
app.use(parser.urlencoded({ extended: true, limit: '5mb' }));

app.use('/static', express.static(__dirname + '/static'));
app.use('/api', require('./controllers/'));

app.get('/', (req, res) => {
  if (config.environment.type == 'dev') {
    req.session.uid = 1,
    req.session.library = '1-testtesttesttesttesttesttesttesttesttest',
    req.session.subscription = moment().add(30, 'days').unix() * 1000;
  }

  res.sendFile(__dirname + '/views/Home.html');
});
app.get('/app/*', (req, res) => res.sendFile(__dirname + '/views/App.html'));

app.listen(config.environment.port, () =>
  console.log('~~Server running on port', config.environment.port)
);

if (config.environment.runCronJobs) require('./jobs/start')();