/**
 * Created by jasen on 24/01/2016.
 */
var express = require('express');
var passport = require('passport');
var router = express.Router();
var connection = require('../db');
var queries = require('../db/queries');

var img_base_url = 'http://d37ue36c90zr4n.cloudfront.net/';
var video_base_url = 'http://d37ue36c90zr4n.cloudfront.net/';
/**
 * list all genres
 */
router.get('/', passport.authenticate('basic', { session: false }),
    function(req, res) {
        connection.query(queries.genres.allGenres, [img_base_url, img_base_url, img_base_url], function(error, result){
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

/**
 * list all songs in a genre
 */

router.get('/songs/:genreId', passport.authenticate('basic', { session: false }), function(req, res) {
    var genId = req.params.genreId;
    console.log(queries.songs.songsInGenre)
    connection.query(queries.songs.songsInGenre, [video_base_url, genId], function(error, result){
        if(error){
            //throw error;
            console.log(error)
            res.send('error on get genre list');
            //connection.end();
        }else {
            res.send(result);
        }
    })
});

//var id = req.params.id;
//    var genId = id.slice(1, req.params.id.length);
//    console.log(queries.songs.songsInGenre)
//    connection.query(queries.songs.songsInGenre, [video_base_url, genId], function(error, result){
//        if(error){
//            //throw error;
//            console.log(error)
//            res.send('error on get genre list');
//            //connection.end();
//        }else {
//            res.send(result);
//        }
//    })

module.exports = router;
