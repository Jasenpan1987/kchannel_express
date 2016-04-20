var express = require('express');
var passport = require('passport');
var router = express.Router();
var connection = require('../db');
var queries = require('../db/queries');
var Q = require('q');

var rokuApiKey = '8225825862AC2049B28CA2C90152A8195642';
/***
 * This route is designed for handling the notification request from roku server.
 * A few items have been implemented to ensure security. Roku sends a responseKey as shown in the examples below.
 * The partner must return this and only this in the response content.
 * Before downloading the content, Roku checks to ensure that the size is equal to the size of what was sent.
 * This prevents hackers from responding with overwhelmingly large chunks of data attempting to crash the Roku system.
 * Additionally, you are required to send an ApiKey header with the value containing your Roku API key that was
 * issued on the developer site. When sending the notification, the subscriber cannot redirect in any way.
 * If a redirect attempt is made, the request will fail.
 * The requests also time out after 10 seconds.
 *
 * Example Notifications
 -----Credit-----
 {
 "customerId": "bbd2d8c616cc4802989da2d800cf2b81",
 "transactionType": "Credit",
 "transactionId": "1243",
 "channelId": "484",
 "channelName": "StwzAbNxMbX779Ia",
 "productCode": "f478e3a9d68d4ff390bb",
 "productName": "Monthly Sub",
 "price": 5.00,"total": 5.00,
 "currency": "usd",
 "partnerReferenceId": "prefid",
 "comments": "Service Credit Test",
 "eventDate": "2014-02-20T20:34:21.1781901Z",
 "responseKey":"659a9e3f6b1649f681a408f1beeb2766"
 }

 -----Sale-----
 {
 "customerId":"ac4d2fd61f624451a61aa2cf00a766a1",
 "transactionType":"Sale",
 "transactionId":"aa3f3a2479ea4e0c88d9a2d500f33e74",
 "channelId":"26558",
 "productCode":"testProd123",
 "price":0.99,
 "tax":0.00,
 "total":0.99,
 "currency":"usd",
 "comments":"New order processed.",
 "eventDate":"2014-02-17T22:45:37.496125Z",
 "responseKey":"659a9e3f6b1649f681a408f1beeb2766"
 }


 -----Refund-----
 {
 "customerId":"ac4d2fd61f624451a61aa2cf00a766a1",
 "transactionType":"Refund",
 "transactionId":"970625d44a544b78964ba2d6011231bd",
 "channelId":"26558",
 "productCode":"testProd123",
 "price":-0.99,
 "tax":0.00,
 "total":-0.99,
 "currency":"usd",
 "originalTransactionId":"dccc31583aa1441e8c76a2d600b28716",
 "originalPurchaseDate":"2014-02-18T18:49:59",
 "partnerReferenceId":"test",
 "comments":"test",
 "eventDate":"2014-02-19T00:38:20.231375Z",
 "responseKey":"c1a73677590948e68215586dfa9455b5"
 }


 -----Cancellation-----
 {
 "customerId": "6a4d984e7aee47d18975a2d800cb707b",
 "transactionType": "Cancellation",
 "transactionId": "260a7b6d8e4a4e7b8b0ba2d800cb7142",
 "channelId": "445",
 "productCode": "fb435917cefc4f66b36c",
 "productName":"Monthly Sub",
 "expirationDate": "2014-02-20T20:20:42.6473452Z",
 "originalTransactionId": "a82e4abdab0247fb9a2ca2d800cb712d",
 "originalPurchaseDate": "2014-02-20T20:20:42",
 "partnerReferenceId": "CANCELTESTNOTIFICATION",
 "comments":"Cancellation for Monthly Sub",
 "eventDate": "2014-02-20T20:20:42.6903495Z",
 "responseKey":"c1a73677590948e68215586dfa9455b5"
 }

 */


var roku_transaction_insertionHandler = function(httpObj){
    //common fields
    var customerId = httpObj.req.body.customerId;
    var userId = httpObj.req.body.userid;
    var transactionType = httpObj.req.body.transactionType;
    var transactionId = httpObj.req.body.transactionId;
    var channelId = httpObj.req.body.channelId;
    var productCode = httpObj.req.body.productCode;

    var comments = httpObj.req.body.comments,
        eventDate = httpObj.req.body.eventDate,
        responseKey = httpObj.req.body.responseKey;

    //unique fields
    /**
     * 1) Credit
     */
    var channelName = httpObj.req.body.channelName,
        productName = httpObj.req.body.productName,
        price = httpObj.req.body.price,
        currency = httpObj.req.body.currency,
        partnerReferenceId = httpObj.req.body.partnerReferenceId;
    /**
     * 2) Sale
     */
    var price = httpObj.req.body.price,
        tax = httpObj.req.body.tax,
        total = httpObj.req.body.total,
        currency = httpObj.req.body.currency;
    /**
     * Refund
     */
    var price = httpObj.req.body.price,
        tax = httpObj.req.body.tax,
        total = httpObj.req.body.total,
        currency = httpObj.req.body.currency,
        originalTransactionId = httpObj.req.body.originalTransactionId,
        originalPurchaseDate = httpObj.req.body.originalPurchaseDate,
        partnerReferenceId = httpObj.req.body.partnerReferenceId;
    /**
     * Cancellation,
     */
    var productName = httpObj.req.body.productName,
        expirationDate = httpObj.req.body.expirationDate,
        originalTransactionId = httpObj.req.body.originalTransactionId,
        originalPurchaseDate = httpObj.req.body.originalPurchaseDate,
        partnerReferenceId = httpObj.req.body.partnerReferenceId;
//customerId, userid, transactionType, transactionId, channelId, channelName, productCode, productName, price,
// total, tax, currency, comments, eventDate, responseKey, originalTransactionId, originalPurchaseDate,
// expirationDate, partnerReferenceId
    var queryArr = [
        customerId, userId, transactionType, transactionId, channelId,
        channelName, productCode, productName, price, total,
        tax, currency, comments, eventDate, responseKey,
        originalTransactionId, originalPurchaseDate, expirationDate, partnerReferenceId
    ]; //19 values

    var deferred = Q.defer();
    connection.query(queries.roku.rokuTransaction,
        queryArr,
        function(error, result){
        if(error){
            deferred.reject(error);
        }else{
            deferred.resolve(httpObj);
        }
    });
    return deferred.promise;
};

var sendResult = function(httpObj){
    var deferred = Q.defer();
    httpObj.res.setHeader('ApiKey', rokuApiKey);
    httpObj.res.send({
        "responseKey": httpObj.req.body.responseKey
    });
    return deferred.promise;
};

var creditHandler = function(httpObj){

    /*var customerId = httpObj.req.body.customerId;
    var transactionType = httpObj.req.body.transactionType;
    var transactionId = httpObj.req.body.transactionId;
    var channelId = httpObj.req.body.channelId;
    var productCode = httpObj.req.body.productCode;

    var comments = httpObj.req.body.comments,
        eventDate = httpObj.req.body.eventDate,
        responseKey = httpObj.req.body.responseKey;*/

    //other transaction logic here

    roku_transaction_insertionHandler(httpObj).then(sendResult).catch(function(error){
        res.status(400);
        res.send('insert into db failed '+error);
    })
};

var saleHandler = function(httpObj){
    /*var customerId = httpObj.req.body.customerId;
    var transactionType = httpObj.req.body.transactionType;
    var transactionId = httpObj.req.body.transactionId;
    var channelId = httpObj.req.body.channelId;
    var productCode = httpObj.req.body.productCode;*/

    //other transaction logic here

    roku_transaction_insertionHandler(httpObj).then(sendResult).catch(function(error){
        res.status(400);
        res.send('insert into db failed '+error);
    })
};

var refundHandler = function(httpObj){
   /* var customerId = httpObj.req.body.customerId;
    var transactionType = httpObj.req.body.transactionType;
    var transactionId = httpObj.req.body.transactionId;
    var channelId = httpObj.req.body.channelId;
    var productCode = httpObj.req.body.productCode;*/

    //other transaction logic here

    roku_transaction_insertionHandler(httpObj).then(sendResult).catch(function(error){
        res.status(400);
        res.send('insert into db failed '+error);
    })
};

var cancellationHandler = function(httpObj){
    /*var customerId = req.body.customerId;
    var transactionType = req.body.transactionType;
    var transactionId = req.body.transactionId;
    var channelId = req.body.channelId;
    var productCode = req.body.productCode;*/

    //other transaction logic here

    roku_transaction_insertionHandler(httpObj).then(sendResult).catch(function(error){
        res.status(400);
        res.send('insert into db failed '+error);
    })
};



router.post('/', function(req, res){
    var transactionType = req.body.transactionType;
    var httpObj = {
        req: req,
        res: res
    };
    switch(transactionType){
        case 'Credit':
            creditHandler(httpObj);
            break;
        case 'Sale':
            saleHandler(httpObj);
            break;
        case 'Refund':
            refundHandler(httpObj);
            break;
        case 'Cancellation':
            cancellationHandler(httpObj);
            break;
    }
});

module.exports = router;