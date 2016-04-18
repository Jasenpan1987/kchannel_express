var express = require('express');
var passport = require('passport');
var router = express.Router();
var connection = require('../db');
var queries = require('../db/queries');

/**
 * TODO: - verify which fields can be obtained from front end
 *
 */

router.post("/", passport.authenticate('basic', { session: false }), function(req, res){
    /*
     (user_id, subscription_id, product_id, price, payment_status, transaction_id, currency, created_at, test_card)
     */
    var userId = req.body.userid;
    var subscriptionId = req.body.subscriptionid;
    var productId = req.body.productid;
    var price = req.body.price;
    var paymentStatus = req.body.paymentstatus;
    var transactionId = req.body.transactionid;
    var currency = req.body.currency;
    var testCard = 0;

    if(transactionId=='99999'){
        testCard = 1;
    }

    console.log(userId, subscriptionId, productId, price, paymentStatus, transactionId, currency, testCard)

    connection.query(queries.payment.createSubscriptionPayment,
        [userId, subscriptionId, productId, price, paymentStatus, transactionId, currency, testCard],
        function(error, result){
            if(error){

            }else{
                console.log('data entered');
                var resData = {
                    status: "success",
                    userId: userId,
                    subscriptionId: subscriptionId,
                    productId: productId,
                    price: price,
                    paymentStatus: paymentStatus,
                    transactionId: transactionId,
                    currency: currency,
                    testCard: testCard
                };

                res.send(resData);
            }
    })
    //res.send('working')
});

module.exports = router;