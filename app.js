var express = require('express');
var app = express();

var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var nconf = require("nconf");
nconf.argv()
  .env()
  .file({ file: 'config.json' });

var auth = require('./routes/auth');
var routes = require('./routes/index');
var ideas = require('./routes/ideas');

var GithubAuthSetup = require("./infrastructure/github-auth-setup");
var githubAuth = new GithubAuthSetup(app);

var databaseSetup = require("./infrastructure/database-setup");
databaseSetup.SetupNoSqlTables();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var host = nconf.get("HostInfo");
var corsOptions = {
  origin: host.SPAUrl,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  preflightContinue: false
};


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'hakans planner hackathon', resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'public')));
githubAuth.Setup();

app.use('/', routes);
app.use('/auth', auth);
app.use('/ideas', function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
        return next(); 
    } else {
      res.status(401).send('Unauthorized');
    }
}, ideas);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

app.listen(3000, function () {
  console.log('Hackathon Planner is listening on port 3000!');
});


module.exports = app;
