var express = require('express');
var passport = require('passport');
var router = express.Router();
var connection = require('../db');
var queries = require('../db/queries');

var img_base_url = 'http://www.dv1.com.au/karaoke/media/catalog/category/';
var video_base_url = 'http://s3-ap-southeast-2.amazonaws.com/kchannelaus/';

router.get('/',passport.authenticate('basic', { session: false }), function(req, res){
    connection.query(queries.featured.featuredGenres, [img_base_url, img_base_url, img_base_url], function(error, result){
        if(error){
            console.log(queries.genres.allGenres)
            //throw error;
            console.log(error)
            res.send('error on get genre list');
            //connection.end();
        }else {
            //console.log(connection);
            res.send(result);
        }
    })
});

module.exports = router;