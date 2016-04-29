/**
 * Created by jpan on 23/03/2016.
 */
var CronJob = require('cron').CronJob;
var mysql      = require('mysql');

//https://github.com/ncb000gt/node-cron

new CronJob('0 */5 * * * *', function() {
    var connection = mysql.createConnection({
        host:'awsktv.c2hsggxo1pgs.ap-southeast-2.rds.amazonaws.com',
        user:'rdsktv',
        password:'KtvRDS15',
        database: 'karaoke_db'
    });
//curdate+4hours   DATE_ADD(NOW(), INTERVAL 2 HOUR)
    connection.query('UPDATE subscription SET STATUS=0 WHERE STATUS=1 AND expiry_date< NOW() + INTERVAL 4 HOUR',
        function(error, result){
            if(error){

            }else {
                //console.log(connection);
            }
        });
}, null, true, 'America/Los_Angeles');