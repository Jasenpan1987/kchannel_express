var express = require('express');
var passport = require('passport');
var Q = require('q');
var router = express.Router();
var connection = require('../db');
var queries = require('../db/queries');

var img_base_url = 'http://d37ue36c90zr4n.cloudfront.net/';
var video_base_url = 'http://d37ue36c90zr4n.cloudfront.net/';



/**
 * get Homeblock
 * use Q to handle promise
 * contains: getBgroupGenre, getT5Genre, getBannerGenre, getNewReleaseGenre
 * when it's all done =>displayRes
 *
 */

var getBgroupGenre = function(res){
    var deferred = Q.defer();
    connection.query(queries.homeblock.bestGroup, [img_base_url, video_base_url], function(error, result){
        if(error){
            //console.log(error)
            deferred.reject(error);
        }else{
            var bestGroup = {'bestGroup':result};
            res.homeblock.push(bestGroup);
            //console.log("running in best group")
            deferred.resolve(res);
        }
    });
    return deferred.promise;
};

var getT5Genre = function(res){
    var deferred = Q.defer();
    connection.query(queries.homeblock.top5,[img_base_url, video_base_url], function(error, result){
        if(error){
            //console.log(error)
            deferred.reject(error);
        }else{
            var top5 = {'top5':result};
            res.homeblock.push(top5);
            //console.log("running in top5")
            deferred.resolve(res);
        }
    });
    return deferred.promise;
};

var getBannerGenre = function(res){
    var deferred = Q.defer();
    connection.query(queries.homeblock.bannerGenre, [img_base_url], function(error, result){
        if(error){
            deferred.reject(error);
        }else{
            var bannerGenre = {'bannerGenre':result};
            res.homeblock.push(bannerGenre);
            console.log("running in bannerGenre");
            deferred.resolve(res);
        }
    });
    return deferred.promise;
};

var getNewReleaseGenre = function(res){
    var deferred = Q.defer();
    connection.query(queries.homeblock.newRelease,[img_base_url, img_base_url, video_base_url], function(error, result){
        if(error){
            //console.log('getnerelease err')
            //console.log(error)
            deferred.reject(error);
        }else{
            var getNewRelease = {'newRelease':result};
            res.homeblock.push(getNewRelease);
            //console.log("running in getNewRelease");
            deferred.resolve(res);
        }
    });
    return deferred.promise;
};

var displayRes = function(res){
    var deferred = Q.defer();
    //console.log(res.homeblock);
    //console.log(res)
    deferred.resolve(res);
    res.send(res.homeblock);
    return deferred.promise;
};

var startParallelActions = function(res){
    res.homeblock = [];
    var promises = [getBgroupGenre(res), getT5Genre(res), getNewReleaseGenre(res), getBannerGenre(res)];
    //console.log(res)
    return Q.all(promises).thenResolve(res);
};

router.get('/', passport.authenticate('basic', { session: false }), function(req, res){

    startParallelActions(res).
        then(displayRes).catch(function(error){
            //console.log(error)
            //console.log(res)
            res.status(500);
            res.send('error on get home block data');
        });
});

module.exports = router;