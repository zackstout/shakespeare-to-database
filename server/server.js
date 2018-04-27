
var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var Sentiment = require('sentiment');
var sentiment = new Sentiment();
var result = sentiment.analyze('shadow');
console.log(result);

// var positivity = require('Sentimental').positivity;
//
//
// console.log(positivity("Node is very super most highly excellent"));

// var csv = require('fast-csv');

var config = {
  database: 'shakes',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
};



// TESTING REVERSE IMAGE SEARCH API:
// var incan_client = require("node-incandescent-client").client;
//
// var client = new incan_client('7420', '746353d0e1b737204b6f13f5fdb49bc6');
//
// app.get('/imageRev', function(req, res) {
//   client.addImageUrl('https://www.almanac.com/sites/default/files/styles/primary_image_in_article/public/images/carrots.jpg?itok=_nIMWR5y');
//
//   client.assemble();
//
//   client.sendRequest(function(projectId) {
//   	console.log(projectId);
//
//   	client.getResults(projectId, function(data) {
//   		console.log(data);
//       res.send(data);
//   	});
//   });
// });





var pool = new pg.Pool(config);

// now we have to think:
// req.body will be {speaker ("BERNARDO"), text ('Hi there'), index ('1.1.1')}


// loop through all CSVs. For each INSERT a new PLAY row, RETURNING id of play.
// if speaker does not exist, INSERT, RETURNING id of speaker.
// how to find speaker of given line? Wait it's given to us. We're overthinking this.
// For each entry in the array, just
// No, we're not overthinking it.
// If speakers table contains the speaker (*constrained to this play*) then add line keyed to the speaker; OTHERWISE add speaker, and add line keyed to speaker.



app.get('/onePlay/:title', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'SELECT * FROM "' + req.params.title + '" ORDER BY act, scene, "lineNo" LIMIT 500;'; // Odd, if lineNo not in quotes, it reads it as all-lowercase
      db.query(queryText, [], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {

          var wordObjs = [];
          result.rows.forEach(row => {
            // var result = sentiment.analyze('evil');
            var words = row.lineText.split(/[\s.,;?]+/);
            // row.words = words;
            var wordObj = {};
            words.forEach(word => {
              var result = sentiment.analyze(word);
              wordObj.word = word;
              wordObj.result = result.score;
              wordObjs.push(wordObj);
              wordObj = {}; // not sure if necessary.
            });

            // Attach the array to the row to send to client:
            row.wordObjs = wordObjs;
            wordObjs = [];
          });

          res.send(result.rows);

        }
      });
    }
  });
});












// We brute forced it:

// Ugh just doing it in one table for now:
app.post('/allLines', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'INSERT INTO "' + req.body.realTitle + '" ("act", "scene", "lineNo", "speaker", "lineText") VALUES ($1, $2, $3, $4, $5);';
      db.query(queryText, [req.body.act, req.body.scene, req.body.lineNo, req.body.speaker, req.body.lineText], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          res.sendStatus(201);
        }
      });
    }
  });
});

// Wow finally something that worked...
app.post('/playTables', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'CREATE TABLE "' + req.body.play + '" ("id" serial PRIMARY KEY, "act" INT NOT NULL, "scene" INT NOT NULL, "lineNo" INT NOT NULL, "speaker" varchar(100) NOT NULL, "lineText" varchar(500) NOT NULL);'; // couldn't use bind $ syntax because of quote marks?
      db.query(queryText, [], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          res.sendStatus(201);
        }
      });
    }
  });
});






var port = process.env.PORT || 4200;


app.use(express.static('./server/public'));


// Listen //
app.listen(port, function(){
  console.log('Listening on port:', port);
});
