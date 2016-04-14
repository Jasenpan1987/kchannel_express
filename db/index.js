var mysql      = require('mysql');
var connection = mysql.createConnection({
    host:'awsktv.c2hsggxo1pgs.ap-southeast-2.rds.amazonaws.com',
    user:'rdsktv',
    password:'KtvRDS15',
    database: 'karaoke_db'
});

module.exports = connection;