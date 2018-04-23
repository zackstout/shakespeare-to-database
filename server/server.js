
var express = require('express');
var app = express();
var pg = require('pg');

// var csv = require('fast-csv');

var config = {
  database: 'shakes',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
};

var pool = new pg.Pool(config);

// var fs = require('fs');
//
// fs.createReadStream('Hamlet.csv')
//   .pipe(csv())
//   .on('data', function(data) {
//     console.log(data);
//   })
//   .on('end', function(data) {
//     console.log('done hoss');
//   });

// fs.readFile('public/csvs/Hamlet.csv', 'utf8', function(err, data) {
//   if (err) {
//     console.log(err);
//   }
//   console.log(data);
// });

var port = process.env.PORT || 4200;


app.use(express.static('./server/public'));


// Listen //
app.listen(port, function(){
   console.log('Listening on port:', port);
});
