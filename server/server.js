
var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// var csv = require('fast-csv');

var config = {
  database: 'shakes',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
};

var pool = new pg.Pool(config);

// now we have to think:
// req.body will be {speaker ("BERNARDO"), text ('Hi there'), index ('1.1.1')}


// loop through all CSVs. For each INSERT a new PLAY row, RETURNING id of play.
// if speaker does not exist, INSERT, RETURNING id of speaker.
// how to find speaker of given line? Wait it's given to us. We're overthinking this.
// For each entry in the array, just
// No, we're not overthinking it.
// If speakers table contains the speaker (*constrained to this play*) then add line keyed to the speaker; OTHERWISE add speaker, and add line keyed to speaker.

// ***PROBLEM***: What if client-side requests trigger server in wonky order, so that we can't use order of lines to determine speaker of each?
// Wait that won't matter -- we don't care about order. We have each speaker attached to each line.





// Global var for current play. (or rather its index in the DB)
// for a new CSV:
// if line number is 8 or whatever, grab the title.

// else, grab titleId from DB.



// WAIT A SECOND, maybe what we want is to send the server the whole object, rather than just a series of lines... That way it can know what the current play is.

// When the server has to send this status back 3000 times, yeah, it takes a couple seconds:
app.post('/postLine', function(req, res) {
  // console.log(req.body); // good, this works



  res.sendStatus(201);
});



var port = process.env.PORT || 4200;


app.use(express.static('./server/public'));


// Listen //
app.listen(port, function(){
   console.log('Listening on port:', port);
});
