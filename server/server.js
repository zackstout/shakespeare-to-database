
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

var allCsvs = [
  'AllsWellThatEndsWell',
  'AntonyandCleopatra',
  'AsYouLikeIt',
  'ComedyofErrors',
  'Coriolanus',
  'Cymbeline',
  'Hamlet',
  'HenryIV,part1',
  'HenryIV,part2',
  'HenryV',
  'HenryVI,part1',
  'HenryVI,part2',
  'HenryVIII',
  'JuliusCaesar',
  'KingJohn',
  'KingLear',
  'LovesLaboursLost',
  'Macbeth',
  'MeasureforMeasure',
  'MerchantofVenice',
  'MerryWivesofWindsor',
  'MidsummerNightsDream',
  'MuchAdoAboutNothing',
  'Othello',
  'Pericles',
  'RichardII',
  'RichardIII',
  'RomeoandJuliet',
  'TamingoftheShrew',
  'TheTempest',
  'TimonofAthens',
  'TitusAndronicus',
  'TroilesandCressida',
  'TwelfthNight',
  'TwoGentlemenofVerona',
  'WintersTale'
];

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



// Function to convert database to better format: plays_names table and plays_text table.

// This worked:
// pool.connect(function(err, db, done) {
//   if (err) {
//     console.log(err);
//   } else {
//     for (let i=0; i < allCsvs.length; i++) {
//       var queryText = "INSERT INTO plays_playname (title) VALUES ($1)";
//       db.query(queryText, [allCsvs[i]], function (errorMakingQuery, result) {
//         done();
//         if (errorMakingQuery) {
//           console.log('Error with country GET', errorMakingQuery);
//         }
//       });
//     }
//   }
// });


// This does not work...yet:
pool.connect(function(err, db, done) {
  if (err) {
    console.log(err);
  } else {
    for (let i=0; i < allCsvs.length; i++) {
      var my_csv = allCsvs[i];
      // Ahhh yes need the WRAPPING parentheses as well!
      (function(csv) {
        // Needed the quotes around table name:
        // **** AND YOU CANNOT USE BLING SYNTAX WITH THAT:
        var queryText = 'SELECT * FROM "' + csv + '";';
        db.query(queryText, [], function (errorMakingQuery, result) {
          // console.log(result.rows[0].title);
          console.log("TEXT: ", result.rows[10].lineText);

          // UH OH: ALL THE IDS ARE BOUND TO 37, THE LAST ID....
          var queryText2 = "SELECT id FROM plays_playname WHERE title=$1"
          db.query(queryText2, [csv], function(err2, res) {
            console.log("ID: ", res.rows[0].id);

            var queryText3 = 'INSERT INTO plays_playtext (act, scene, lineno, speaker, text, play_id) VALUES ($1, $2, $3, $4, $5, $6);';
            db.query(queryText3, [], function(err3, res3) {
              console.log("res3: ", res3);
              done();
              if (err3) console.log(err3);
            });
            done();
            if (err) console.log(err2);
          })
          done();
          if (errorMakingQuery) console.log(errorMakingQuery);
        });
      })(my_csv);

    }
  }
});


// Let's just create some text to play with:



app.get('/searchPlay/:val/:play', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'SELECT * FROM "' + req.params.play + '" WHERE "lineText" ~ $1 ORDER BY act, scene, "lineNo";';
      db.query(queryText, [req.params.val], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          // console.log(result);
          res.send(result.rows);
          // res.sendStatus(201);
        }
      });
    }
  });
});

app.get('/searchSpeakPlay/:val/:play', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      // Not clear why i did this both ways... Oh probably because of quote marks.
      var queryText = 'SELECT * FROM "' + req.params.play + '" WHERE "speaker" ~ $1 ORDER BY act, scene, "lineNo";';
      db.query(queryText, [req.params.val], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          // console.log(result);
          res.send(result.rows);
          // res.sendStatus(201);
        }
      });
    }
  });
});

app.get('/fullSearch/:val/:play/:word', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'SELECT * FROM "' + req.params.play + '" WHERE "speaker" ~ $1 AND "lineText" ~ $2 ORDER BY act, scene, "lineNo";';
      db.query(queryText, [req.params.val, req.params.word], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          // console.log(result);
          res.send(result.rows);
          // res.sendStatus(201);
        }
      });
    }
  });
});

// Damn this is insanely fast, for getting the sentiment of each word in the play...
app.get('/playWords/:play', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'SELECT * FROM "' + req.params.play + '" ORDER BY act, scene, "lineNo";'; // Odd, if lineNo not in quotes, it reads it as all-lowercase
      db.query(queryText, [], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          // console.log(result);
          let wordObjs = [];
          result.rows.forEach(row => {
            var words = row.lineText.split(/[\s.,;?]+/); // ignoring all punctuation -- but we'll need it.

            // IDEA: do a manual "split": loop through all characters, keeping track of current word. If you run into a punctuation mark, push current word and clear it out, and then add the punctuation mark to that word.

            var wordObj = {};
            words.forEach(word => {
              if (word.length > 0) {
                word = word.match(/[^"]+/) === null ? '' : word.match(/[^"]+/).join("");
              }
              var result = sentiment.analyze(word);
              wordObj.word = word;
              wordObj.result = result.score;
              wordObjs.push(wordObj);
              wordObj = {}; // not sure if necessary. Might just overwrite properties automatically.
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


// This solution (passing in /:num) won't work for multiple users, I fear:
app.get('/onePlay/:title/:num', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      const limit = 100;
      console.log("I: ", req.params.num);
      var queryText = 'SELECT * FROM "' + req.params.title + '" ORDER BY act, scene, "lineNo" LIMIT $1 OFFSET $2;'; // Odd, if lineNo not in quotes, it reads it as all-lowercase
      db.query(queryText, [limit, limit * req.params.num], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {

          let wordObjs = [];
          result.rows.forEach(row => {
            var words = row.lineText.split(/[\s.,;?]+/); // ignoring all punctuation -- but we'll need it.

            var wordObj = {};
            words.forEach(word => {
              if (word.length > 0) {
                word = word.match(/[^"]+/) === null ? '' : word.match(/[^"]+/).join("");
              }
              var result = sentiment.analyze(word);
              wordObj.word = word;
              wordObj.result = result.score;
              wordObjs.push(wordObj);
              wordObj = {}; // not sure if necessary. Might just overwrite properties automatically.
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
