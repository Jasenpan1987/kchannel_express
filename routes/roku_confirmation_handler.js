/**
 * Created by jpan on 4/05/2016.
 */
var express = require('express');
var passport = require('passport');
//var superagent = require('superagent');
var request = require('request');
var Q = require('q');
var router = express.Router();
var connection = require('../db');
var queries = require('../db/queries');
var atob = require('base-64');
var xml2js = require('xml2js').parseString;

var rokuApiKey = '8225825862AC2049B28CA2C90152A8195642';//1767EB88A2FDE842879FA586015184B75642

var getTransaction = function(httpObj){
    var userid = httpObj.req.params.userid;
    var productId = 'ROKUMON1';
    var deferred = Q.defer();

    connection.query(queries.roku.rokuGetTransactionIdByUserid, [userid, productId],
        function(error, result){
            if(error){
                error.customizedInfo = 'errOnFindTransactionId';
                deferred.reject(error);
            }else{
                if(result.length == 0){
                    var error = {};
                    error.customizedInfo = 'emptyOnFindTransactionId';
                    deferred.reject(error);
                }else{
                    console.log(result[0]);
                    httpObj.transactionId = result[0].transaction_id;
                    httpObj.subscriptionId = result[0].subscription_id;
                    console.log(httpObj.transactionId, httpObj.subscriptionId);
                    deferred.resolve(httpObj)
                }
            }
        });

    return deferred.promise;
};

var rokuApiVerfification = function(httpObj){
    //console.log('222222'+httpObj.transactionId)
    //console.log(httpObj.transactionId)
    //https://apipub.roku.com/listen/transaction-service.svc/validate-transaction/
    // 8225825862AC2049B28CA2C90152A8195642/4c24eb79111b4b6dbfa2a5e50162b11f

    var deferred = Q.defer();
    var urlStr = 'https://apipub.roku.com/listen/transaction-service.svc/validate-transaction/'+rokuApiKey+'/'
        +httpObj.transactionId;
    console.log(urlStr)
    //[ { _: 'Failure', '$': { xmlns: '' } } ] ||  [ { _: 'Success', '$': { xmlns: '' } } ]
    request(urlStr, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Print the google web page.
        }
        if(error){
            error.customizedInfo = 'rokuApiError';
            deferred.reject(error)
        }else{
            if(response.statusCode != 200){
                var error = {};
                error.customizedInfo = 'rokuApiError';
                deferred.reject(error)
            }else{
            //[ { '$': { 'i:nil': 'true', xmlns: '' } } ]
                xml2js(response.body, function (err, result) {

                    if(result.result.status[0]._ != 'Success'){
                        var error = {};
                        error.customizedInfo = 'rokuApiError';
                        deferred.reject(error)
                    }else{
                        //console.log(result.result.channelName);
                        httpObj.confirmedExpDate = result.result.expirationDate[0];
                        console.log(httpObj.confirmedExpDate);

                        deferred.resolve(httpObj)
                    }

                })
            }
        }
    });

    return deferred.promise;
};

var updateExpirationDate = function(httpObj){
    var deferred = Q.defer();
    var expDate = httpObj.confirmedExpDate;

    if((new Date(expDate))< (new Date())){//expiration date is latter than now
        console.log(expDate +' has expired')
        httpObj.validity = 0;
        deferred.resolve(httpObj)
    }else{//expiration date is earlier than now

        var expStr = expDate.replace('T', ' ');
        connection.query(queries.roku.updateSubscription, [expStr, httpObj.subscriptionId],
            function(error){
                if(error){
                    error.customizedInfo = 'updateDbError';
                    deferred.reject(error)
                }else{
                    httpObj.validity = 1;
                    deferred.resolve(httpObj)
                }
            }
        );

    }

    return deferred.promise;
};

var sendResult = function(httpObj){
    httpObj.res.send({validity: httpObj.validity});
};

router.get('/:userid', passport.authenticate('basic', { session: false }),
    function(req, res){
        var httpObj = {
            req: req,
            res: res
        };

        getTransaction(httpObj).then(rokuApiVerfification).then(updateExpirationDate).then(sendResult).
            catch(function(error){
            //console.log('aaaaaaa');
                console.log(error)
            httpObj.res.status(400);
            httpObj.res.send(error.customizedInfo);
        })
    }
);

module.exports = router;