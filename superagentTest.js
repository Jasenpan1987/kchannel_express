/**
 * Created by jpan on 4/05/2016.
 */
//var superAgent = require('superagent')
//
//superAgent
//    .get('https://apipub.roku.com/listen/transaction-service.svc/validate-transaction/8225825862AC2049B28CA2C90152A8195642/4c24eb79111b4b6dbfa2a5e50162b11f')
//    .end(function(error, res){
//        if(error){
//            //error.customizedInfo = 'rokuApiError'
//            //deferred.reject(error)
//            console.log(error)
//        }else{
//            console.log(res.result);
//
//        }
//    });


var request = require('request');
request('https://apipub.roku.com/listen/transaction-service.svc/validate-transaction/8225825862AC2049B28CA2C90152A8195642/4c24eb79111b4b6dbfa2a5e50162b11f', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Print the google web page.
    }
})