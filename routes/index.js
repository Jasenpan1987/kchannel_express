var express = require('express');
var router = express.Router();
var passport = require('passport');
var connection = require('../db');
var cors = require('cors');

router.all('*', function(req, res, next) {
	console.log('alllllllll');
       res.header("Access-Control-Allow-Origin", "*");
       res.header("Access-Control-Allow-Headers", "X-Requested-With");
       res.header('Access-Control-Allow-Headers', 'Content-Type');
       next();
});

/* GET home page. */
router.get('/', passport.authenticate('basic', { session: false }),
    function(req, res, next) {
  res.render('index', { title: 'Express' });
});





// server.opts(/.*/, function (req,res,next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     //res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//     res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
//     res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
//     res.send(200);
//     return next();
// });


router.get('/test', function(req, res){
    console.log('test route');
    res.send('aaaaaa');
});

router.get('/testpage', function(req, res){
	res.render('tester', {});
});

module.exports = router;
