var express = require('express');
var passport = require('passport');
var router = express.Router();
var connection = require('../db');
var queries = require('../db/queries');

var img_base_url = 'http://d37ue36c90zr4n.cloudfront.net/';
var video_base_url = 'http://d37ue36c90zr4n.cloudfront.net/';

router.get('/',passport.authenticate('basic', { session: false }), function(req, res){
    connection.query(queries.featured.featuredGenres, [img_base_url, img_base_url, img_base_url], function(error, result){
        if(error){
            console.log(queries.genres.allGenres);
            //throw error;
            //console.log(error)
            res.status(500);
            res.send('error on get genre list');
            //connection.end();
        }else {
            //console.log(connection);
            res.send(result);
        }
    })
});

module.exports = router;