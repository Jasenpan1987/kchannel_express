var express = require('express');
var passport = require('passport');
var Q = require('q');
var router = express.Router();
var connection = require('../db');
var queries = require('../db/queries');
var atob = require('base-64');

var img_base_url = 'http://kchannel.s3.amazonaws.com/';
var video_base_url = 'http://s3-ap-southeast-2.amazonaws.com/kchannelaus/';
/**
 * get all subscription types
 */

router.get('/subscriptionlist', passport.authenticate('basic', { session: false }),function(req, res){
    var authStr = req.headers.authorization;
    var subStr = authStr.split('Basic ')[1];
    var subEncode = atob.decode(subStr);
    var platformUsername = subEncode.split(':')[0];
    var platformPassword = subEncode.split(':')[1];

    connection.query(queries.users.getUserPlatform, [platformUsername, platformPassword], function(err, result) {
        if (err) {
            res.status(400);
            res.send('error on get user list')
        }else{

            if(result == []){
                res.send([]);
            }else{
                var platformid = result[0].platformid;
                connection.query(queries.users.allSubscription,[platformid], function(error, result){
                    if(error){
                        res.status(400);
                        res.send('error on searching subscription detail');
                    }else{
                        res.send(result);
                    }
                })
            }

        }
    });

});

/**
 * get a subscription type by subscription type id
 */
router.get('/subscriptionlist/:subscriptionid', passport.authenticate('basic', { session: false }),
    function(req, res){
        var subscriptionId = req.params.subscriptionid;
        if(subscriptionId==''||subscriptionId==null||subscriptionId==undefined){
            res.send('invalid device code');
        }else{
            var authStr = req.headers.authorization;
            var subStr = authStr.split('Basic ')[1];
            var subEncode = atob.decode(subStr);
            var platformUsername = subEncode.split(':')[0];
            var platformPassword = subEncode.split(':')[1];

            connection.query(queries.users.getUserPlatform, [platformUsername, platformPassword], function(err, result) {
                if (err) {
                    res.status(400);
                    res.send('error on get user list')
                }else{

                    if(result == []){
                        res.send([]);
                    }else{
                        var platformid = result[0].platformid;
                        connection.query(queries.users.getSubscriptionById, [subscriptionId, platformid],function(error, result){
                            if(error){
                                res.status(400);
                                res.send('error on searching user');
                            }else{
                                res.send(result);
                            }
                        })
                    }

                }
            });
        }
    });

/**
 * get all users
 */
router.get('/', passport.authenticate('basic', { session: false }),function(req, res){

    var authStr = req.headers.authorization;
    var subStr = authStr.split('Basic ')[1];
    var subEncode = atob.decode(subStr);
    var platformUsername = subEncode.split(':')[0];
    var platformPassword = subEncode.split(':')[1];

    connection.query(queries.users.getUserPlatform, [platformUsername, platformPassword], function(err, result) {
        if (err) {
            res.status(400);
            res.send('error on get user list')
        }else{

            if(result == []){
                res.send([]);
            }else{
                var platformid = result[0].platformid;
                connection.query(queries.users.allUsers, [platformid], function(error, result){
                    if(error){
                        res.status(400);
                        res.send('error on searching user');
                    }else{
                        res.send(result);
                    }
                })
            }

        }
    });


});
/**
 * get a user by device code
 */
router.get('/:devicecode', passport.authenticate('basic', { session: false }),function(req, res){
    var deviceCode = req.params.devicecode;
    var authStr = req.headers.authorization;
    var subStr = authStr.split('Basic ')[1];
    var subEncode = atob.decode(subStr);
    var platformUsername = subEncode.split(':')[0];
    var platformPassword = subEncode.split(':')[1];

    if(deviceCode==''||deviceCode==null||deviceCode==undefined){
        res.status(400);
        res.send('invalid device code');
    }else{
        connection.query(queries.users.getUserPlatform, [platformUsername, platformPassword], function(err, result) {
            if (err) {
                res.status(400);
                res.send('error on get user list')
            }else{

                if(result == []){
                    res.send([]);
                }else{
                    var platformid = result[0].platformid;
                    connection.query(queries.users.getuserByDevice, [deviceCode, platformid],function(error, result){
                        if(error){
                            res.status(400);
                            res.send('error on searching user');
                        }else{
                            res.send(result);
                        }
                    })
                }

            }
        });
    }
});
/**
 * create a user from its device id
 */

var getUser = function(httpObj){

    var deferred = Q.defer();
    connection.query(queries.users.getuserByDevice, [httpObj.req.body.devicecode, httpObj.platformid], function(error, result){
        if(error){

            deferred.reject(error);
        }else{

            if(result.length!=0){
                //user is exist
                httpObj.res.status(400);
                httpObj.res.send("user is already exist")
                deferred.reject("user exist")
            }else{
                userDetail = result;
                deferred.resolve(httpObj);
            }
        }
    });
    return deferred.promise;
};

var getNextUserId = function(httpObj){
    var deferred = Q.defer();
    connection.query(queries.users.getMaxUserId, function(error, result){
        if(error){
            deferred.reject(error);
        }else{
            nextUserId = (result[0].user_id-0)+1;
            //console.log(nextUserId)
            deferred.resolve(httpObj);
        }
    });
    return deferred.promise;
};

var createUser = function(httpObj){
    var deferred = Q.defer();

    if(userDetail.length!=0){
        //throw 'error';
        deferred.reject(err)
    }else{
        connection.beginTransaction(function(err) {
            if (err) {
                deferred.reject(err)
            }else{
                if(httpObj.req.body.devicecode){
                    var deviceCode = httpObj.req.body.devicecode;
                }else{
                    deferred.reject(err)
                }

                if(httpObj.req.body.username){
                    var userName = httpObj.req.body.username;
                }else {
                    var userName = null;
                }

                if(httpObj.req.body.email){
                    var email = httpObj.req.body.email;
                }else {
                    var email = null;
                }

                if(httpObj.req.body.password){
                    var password = httpObj.req.body.password;
                }else {
                    var password = null;
                }

                if(httpObj.req.body.ip_address){
                    var ipAddress = httpObj.req.body.ip_address;
                }else {
                    var ipAddress = null;
                }

                if(httpObj.req.body.mac_address){
                    var macAddress = httpObj.req.body.mac_address;
                }else {
                    var macAddress = null;
                }

                connection.query(queries.users.createUser,
                    [nextUserId,deviceCode,userName,email,password,ipAddress,macAddress], function(err, result) {
                        if (err) {
                            return connection.rollback(function() {
                                deferred.reject(err)
                            });
                        }else{
                            deferred.resolve(httpObj);
                        }
                    });
            }
        });
        return deferred.promise;
    }
};

var getPlatform = function(httpObj){
    var deferred = Q.defer();

    var authStr = httpObj.req.headers.authorization;
    var subStr = authStr.split('Basic ')[1];
    var subEncode = atob.decode(subStr);
    var platformUsername = subEncode.split(':')[0];
    var platformPassword = subEncode.split(':')[1];

    connection.query(queries.users.getUserPlatform, [platformUsername, platformPassword], function(err, result) {
        if (err) {
            return connection.rollback(function() {
                deferred.reject(err)
            });
        }else{
            if(result == []){
                deferred.reject(err)
            }else{
                httpObj.platformid = result[0].platformid;
                deferred.resolve(httpObj);
            }

        }
    });
    return deferred.promise;
};

var userPlatform = function(httpObj){
    var deferred = Q.defer();
    connection.query(queries.users.createUserPlatform, [nextUserId, httpObj.platformid], function(err, result) {
        if (err) {

            return connection.rollback(function() {
                deferred.reject(err)
            });
        }else{
            deferred.resolve(httpObj);
        }
    });
    return deferred.promise;
};

var commitTrans = function(httpObj){

    var deferred = Q.defer();
    connection.commit(function(err) {
        if (err) {
            return connection.rollback(function() {
                deferred.reject(err)
            });
        }else{
            deferred.resolve(httpObj);
        }
    });
    return deferred.promise;
};

var recheckUser = function(httpObj){
    var deferred = Q.defer();

    connection.query(queries.users.getuserByDevice, [httpObj.req.body.devicecode,
        httpObj.platformid], function(error, result){
        if(error){
            deferred.reject(err)
        }else {

            httpObj.res.send({
                "status": "create user successful",
                "userDeviceCode": httpObj.req.body.devicecode,
                "userId": result[0].user_id
            });

            deferred.resolve(httpObj);
        }
    });
    return deferred.promise;
};

/**
 * post data:
 * 1) devicecode (compulsory)
 * 2) username
 * 3) email
 * 4) password
 * 5) ip_address
 * 6) mac_address
 */

router.post('/', passport.authenticate('basic', { session: false }), function(req, res){
    var userDetail = [];
    var nextUserId = null;
    var httpObj = {
        req: req,
        res: res
    };
    getPlatform(httpObj).then(getUser).then(getNextUserId).then(createUser).
        then(userPlatform).then(commitTrans).then(recheckUser).
        catch(function(error){
            res.status(400);
            res.send('error on create user');
        });
});


router.get('/subscription/:userid', passport.authenticate('basic', { session: false }), function(req, res){
    //console.log("user subscrption")
    connection.query(queries.users.userHasSubscription, [req.params.userid], function(err, result) {
        //console.log(req.params.userid)
        if (err) {
            res.status(400);
            res.send('error on check user subscription')
        }else{
            subscriptionDetail = result;
            res.send(result);
        }
    });
});

var checkUserById = function(httpObj){
    var deferred = Q.defer();

    connection.query(queries.users.checkUserById, [httpObj.req.body.userid], function(err, result){
        //console.log('aaaa   '+httpObj.req.body.userid)
        if(err){
            //console.log(err)
            deferred.reject(err)
        }else{
            if(result.length==0){
                //console.log('length=0')

                deferred.reject('error')
            }else{
                deferred.resolve(httpObj);
            }
        }
    });
    return deferred.promise;
};



var checkSubscriptionById = function(httpObj){
    var deferred = Q.defer();
    //console.log('checkSubscriptionById='+httpObj.req.body.subscriptiontypeid);
    connection.query(queries.users.checkSubscriptionById,
        [httpObj.req.body.subscriptiontypeid, httpObj.platformid],
        function(err, result){
            if(err){
                //console.log(err)
                deferred.reject(err)
            }else{
                if(result.length==0){

                    deferred.reject('error')
                }else{

                    deferred.resolve(httpObj);
                }
            }
        });
    return deferred.promise;
};

var getSubscriptionType = function(httpObj){
    var deferred = Q.defer();
    //console.log(httpObj.req.body.subscriptiontypeid, httpObj.platformid)
    connection.query(queries.users.getSubscriptionType,
        [httpObj.req.body.subscriptiontypeid,
        httpObj.platformid],
        function(err, result){
            if(err){
                deferred.reject(err)
            }else{
                if(result.length==0){
                    //console.log(result[0])
                    deferred.reject('error')
                }else{
                    httpObj.subscription_obj = result[0];

                    //console.log(result);
                    deferred.resolve(httpObj);
                }
            }
        });
    return deferred.promise;
};

var createUserSubscription = function(httpObj){
    var duration = httpObj.subscription_obj.duration;
    if(duration){
        //var now = new Date();
        var dateNum = new Date().setSeconds(new Date().getSeconds()+duration);
        var expDate = new Date(dateNum);
        //console.log(typeof expDate+"--------------------")
        var expDate = (expDate).toISOString().substring(0, 19).replace('T', ' ');

    }else{
        var dateNum = new Date().setSeconds(new Date().getSeconds()+31536000*10);
        var expDate = new Date(dateNum);
        //console.log(typeof expDate+"--------------------")
        var expDate = (expDate).toISOString().substring(0, 19).replace('T', ' ');
    }

    var deferred = Q.defer();
    //console.log(httpObj.req.body.userid, httpObj.req.body.subscriptiontypeid, expDate)
    connection.query(queries.users.createSubscription,
        [httpObj.req.body.userid, httpObj.req.body.subscriptiontypeid, expDate], function(err, result){
            if(err){
                console.log(err)
                deferred.reject(err)
            }else{
                console.log(result.insertId+"========");
                httpObj.req.body.subscriptionid = result.insertId;
                deferred.resolve(httpObj);
            }
        });
    return deferred.promise;
};



var createSubscriptionPayment = function(httpObj){
    //console.log('11111111')
    var deferred = Q.defer();
    httpObj.req.body.testcard = 0;
    if(httpObj.req.body.subscriptionid == '99999'){
        testcard = 1;
    }
    console.log(httpObj.req.body.userid, httpObj.req.body.subscriptionid,
        httpObj.req.body.productid, httpObj.req.body.price,
        1, httpObj.req.body.transactionid, httpObj.req.body.currency, httpObj.req.body.testcard);

    connection.query(queries.payment.createSubscriptionPayment,
        [httpObj.req.body.userid, httpObj.req.body.subscriptionid,
            httpObj.req.body.productid, httpObj.req.body.price,
            1, httpObj.req.body.transactionid, httpObj.req.body.currency, httpObj.req.body.testcard],
    function(error, result){
        if(error){
            console.log(error)
            deferred.reject(error);
        }else{
            deferred.resolve(httpObj);
        }
    })
    //console.log(httpObj.req.body.userid, httpObj.req.body.subscriptiontypeid)
    return deferred.promise;
}

var sendResult = function(httpObj){

    var deferred = Q.defer();
    connection.query(queries.users.getSubscriptionType, [httpObj.req.body.subscriptiontypeid
        , httpObj.platformid],
        function(error, result){
            if(error){

                deferred.reject(error)
            }else {
                httpObj.res.send({
                    "status": "successful",
                    "userId": httpObj.req.body.userid,
                    "subscriptionCode": httpObj.req.body.subscriptiontypeid,
                    "subscriptionType": result[0].subscription_name
                });
            }
        });

    return deferred.promise;
};

/**
 * post data:
 * 1) userid
 * 2) subscriptiontypeid
 */
router.post('/subscription', passport.authenticate('basic', { session: false }), function(req, res){

    var httpObj = {
        req: req,
        res: res
    };
    //
    getPlatform(httpObj).then(checkUserById).then(checkSubscriptionById).then(getSubscriptionType)
        .then(createUserSubscription).then(createSubscriptionPayment).then(sendResult)
        .catch(function(error){
            console.log(error)
            res.status(400);
            res.send('error on create user');
        });
});



module.exports = router;
