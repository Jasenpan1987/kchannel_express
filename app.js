var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var connection = require('./db');
var passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;
var queries = require('./db/queries');

var routes = require('./routes/index');
var users = require('./routes/users');
var genres = require('./routes/genres');
var songs = require('./routes/songs');
var featured = require('./routes/featured');
var playlist = require('./routes/playlist');
var homeblock = require('./routes/homeblock');
var payment = require('./routes/payment');

// Configure the Basic strategy for use by Passport.
//
// The Basic strategy requires a `verify` function which receives the
// credentials (`username` and `password`) contained in the request.  The
// function must verify that the password is correct and then invoke `cb` with
// a user object, which will be set at `req.user` in route handlers after
// authentication.

passport.use(new Strategy(
    function(username, password, cb) {
      connection.query(queries.getAuthUser, [username, password], function(error, result){

        if(error){
          return cb(error);
        }else if(result.length==0){
          return cb(null, false);
        }else{
          return cb(null, result);
        }
      })
    }));

var app = express();


app.options('/.*/', function(req, res){
  console.log('options is called');
})
// app.all('*',function (req, res, next) {
//   console.log("app alllllllll")
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//   res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

//   if (req.method == 'OPTIONS') {
//     console.log('aaaa');
//     res.send(200);
//   }
//   else {
//     next();
//   }
// });

// app.options('*', cors());
// view engine setup
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/genres', genres);
app.use('/songs', songs);
app.use('/featured', featured);
app.use('/playlist', playlist);
app.use('/homeblock', homeblock);
app.use('/payment', payment);



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
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
