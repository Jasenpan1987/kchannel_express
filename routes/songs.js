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
 * list all songs
 */
router.get('/', passport.authenticate('basic', { session: false }),
    function(req, res) {
        connection.query(queries.songs.allSongs, [img_base_url, video_base_url],
            function(error, result){
            if(error){
                //throw error;
                console.log(error);
                res.send('error on get genre list');
                //connection.end();
            }else {
                //console.log(connection);
                res.send(result);
            }
        })
    });


/**
 * list song/songs for a given songId
 * songID=> /:s10
 */

router.get('/:id',passport.authenticate('basic', { session: false }), function(req, res){
    var songId = req.params.id;
    connection.query(queries.songs.singleSong, [img_base_url, video_base_url, songId], function(error, result){
        if(error){
            //throw error;
            console.log(error);
            res.send('error on get genre list');
            //connection.end();
        }else {
            res.send(result);
        }
    });
    //if(req.params.id.indexOf('s')!=-1){
    //    var id = req.params.id;
    //    var songId = id.slice(1, req.params.id.length);
    //    connection.query(queries.songs.singleSong, [video_base_url, songId], function(error, result){
    //        if(error){
    //            //throw error;
    //            console.log(error)
    //            res.send('error on get genre list');
    //            //connection.end();
    //        }else {
    //            res.send(result);
    //        }
    //    })
    //}else if(req.params.id.indexOf('g')!=-1){
    //    var id = req.params.id;
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
    //}else{
    //    res.send('Invalid genre or song ID');
    //}

});



module.exports = router;

/**
 router.get('/songs/:genreid',passport.authenticate('basic', { session: false }), function(req, res){

});
 */