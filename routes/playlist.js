/**
 * Created by jasen on 24/01/2016.
 */
var express = require('express');
var passport = require('passport');
var Q = require('q');
var atob = require('base-64');
var router = express.Router();
var connection = require('../db');
var queries = require('../db/queries');

var img_base_url = 'http://www.dv1.com.au/karaoke/media/catalog/category/';
var video_base_url = 'http://s3-ap-southeast-2.amazonaws.com/kchannelaus/';

/**
 * list all playlists
 */
router.get('/', passport.authenticate('basic', { session: false }), function(req, res){
    var authStr = req.headers.authorization;
    var subStr = authStr.split('Basic ')[1];
    var subEncode = atob.decode(subStr);
    var platformUsername = subEncode.split(':')[0];
    var platformPassword = subEncode.split(':')[1];
    console.log(platformUsername, platformPassword);
    connection.query(queries.users.getUserPlatform, [platformUsername, platformPassword], function(err, result) {
        if (err) {
            res.status(400);
            res.send('error on get user list')
        }else{

            if(result == []){
                res.send([]);
            }else{
                var platformid = result[0].platformid;
                connection.query(queries.playlist.allPlaylists, [platformid],
                    function(error, result){
                        console.log('platformid'+platformid)
                    if(error){
                        //throw error;
                        console.log(error)
                        res.send('error on get genre list');
                    }else {
                        //console.log(connection);
                        res.send(result);
                    }
                })
            }

        }
    });
});

/**
 * create a playlist
 * TODO: need to promisfy
 */

router.post('/', passport.authenticate('basic', { session: false }), function(req, res){
    console.log("herererereerere")
    var playlistName = req.body.playlistname;
    var userId = req.body.userid;
    var playlistSongs = req.body.playlistsongs;
    console.log(playlistSongs)
    playlistSongs = playlistSongs.replace('"', '');
    playlistSongs = playlistSongs.replace("'", "");
    var playlistArr = playlistSongs.split(',');
    var playlistId;
    var a = '0'
    console.log(playlistName, userId, playlistArr);
    var errArr = [];

    connection.query(queries.users.checkUserById, [userId], function(err, result){
        if(err){
            res.send('userId does not exist');
        }else{
            if(result.length==0){
                res.send('userId does not exist');
            }else{
                connection.query(queries.playlist.getMaxPlaylistId, function(error, result){
                    if(error){
                        //throw error;
                        //console.log(error);
                        errArr.push(error);
                    }else {
                        playlistId = (result[0].playlist-0)+1;
                        console.log(playlistId);
                        connection.beginTransaction(function(err) {
                            if (err) { errArr.push(error); }
                            connection.query(queries.playlist.newPlaylist, [playlistId, playlistName, userId, 1], function(err, result) {
                                if (err) {
                                    errArr.push(error);
                                    return connection.rollback();
                                }else{
                                    playlistArr.forEach(function(songid, index){
                                        connection.query(queries.playlist.addSongsToPlaylist, [playlistId, songid, 1], function(err, result) {
                                            //console.log('foreach...'+index)
                                            if (err) {
                                                errArr.push(error);
                                                return connection.rollback(function(){
                                                    res.send('error')
                                                });
                                            }else{
                                                if(index==playlistArr.length-1){
                                                    console.log(errArr.length)
                                                    if(errArr.length == 0){
                                                        connection.commit(function(err) {
                                                            if (err) {
                                                                errArr.push(error);
                                                                return connection.rollback();
                                                            }else{
                                                                if(errArr.lengh==0){
                                                                    res.send('error2')
                                                                }else{
                                                                    console.log('success'+a)
                                                                    var resData = {
                                                                        "status": "successful",
                                                                        "userId": userId,
                                                                        "playlistId": playlistId,
                                                                        "playlistName": playlistName
                                                                    };
                                                                    res.send(resData);
                                                                }
                                                            }
                                                        });
                                                    }else{
                                                        res.send('error3');
                                                    }
                                                }
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                })
            }
        }
    })


});
/**
 * list all playlist for a given user ID
 */
router.get('/:userid', passport.authenticate('basic', { session: false }), function(req, res){
    var userId = req.params.userid;
    connection.query(queries.playlist.playlistsInUserId, [userId], function(error, result){
        if(error){
            //throw error;
            console.log(error)
            res.send('error on get genre list');
        }else {
            //console.log(connection);
            res.send(result);
        }
    })
});

/**
 * list all the songs for a given playlist
 */
router.get('/songs/:playlistid', passport.authenticate('basic', { session: false }), function(req, res){
    var playlistId = req.params.playlistid;
    connection.query(queries.playlist.songsInPlaylist, [video_base_url, playlistId], function(error, result){
        if(error){
            //throw error;
            console.log()
            console.log(error)
            res.send('invalid playlist id');
        }else {
            //console.log(connection);
            res.send(result);
        }
    })
});

module.exports = router;