
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


app.get('/title/:name', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'SELECT * FROM "plays" WHERE "name" = $1;';
      db.query(queryText, [req.params.name], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          res.send(result.rows);
        }
      });
    }
  });
});

app.post('/title', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'INSERT INTO "plays" ("title") VALUES ($1) RETURNING "id" as id;';
      db.query(queryText, [req.body], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          res.send(result.rows[0].id);
        }
      });
    }
  });
});

app.get('/speaker/:name/:titleId', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'SELECT * FROM "speakers" JOIN "plays" ON "speakers"."play_id" = "plays"."id" WHERE "speakers"."name" = $1 AND "plays"."id" = $2;';
      db.query(queryText, [req.params.name, req.params.titleId], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          res.send(result.rows);
        }
      });
    }
  });
});

app.post('/speaker', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'INSERT INTO "speakers" ("name", "play_id") VALUES ($1, $2) RETURNING "id" as id;';
      db.query(queryText, [req.body.name, req.body.play_id], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Error with country GET', errorMakingQuery);
          res.sendStatus(501);
        } else {
          res.send(result.rows[0].id);
        }
      });
    }
  });
});

app.post('/line', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'INSERT INTO "lines" ("index", "text", "speaker_id") VALUES ($1, $2, $3);';
      db.query(queryText, [req.body.index, req.body.text, req.body.speaker_id], function (errorMakingQuery, result) {
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


  // WAIT A SECOND, maybe what we want is to send the server the whole object, rather than just a series of lines... That way it can know what the current play is.

  // When the server has to send this status back 3000 times, yeah, it takes a couple seconds:
  app.post('/postLine', function(req, res) {
    // console.log(req.body); // good, this works

    // getPlay('dicks');

    pool.connect(function (err, db, done) {
      var queryText;
      if (err) {
        console.log("Error connecting: ", err);
        // res.sendStatus(500);
      }
      else {
        queryText = 'SELECT * FROM "plays" WHERE "name" = $1;';
        db.query(queryText, [req.body.title], function (errorMakingQuery, result) {
          // done();
          if (errorMakingQuery) {
            console.log('Error with country GET', errorMakingQuery);
            // res.sendStatus(501);
          } else {
            var titleId;
            if (result.rows.length === 0) {
              // Insert new title. RETURN new id.
              queryText = 'INSERT INTO "plays" ("name") VALUES ($1) RETURNING "id" as id;';
              db.query(queryText, [req.body.title], function(err2, result2) {
                if (err2) {
                  console.log('err2', err2);
                  // res.sendStatus(501);
                } else {
                  titleId = result2.rows[0].id;
                }
              });
            } else {
              titleId = result.rows[0].id;
              // console.log(titleId);
            }
            console.log('titleId is ', titleId);

            queryText = 'SELECT * FROM "speakers" JOIN "plays" ON "speakers"."play_id" = "plays"."id" WHERE "speakers"."name" = $1 AND "plays"."id" = $2;';

            db.query(queryText, [req.body.speaker, titleId], function(err3, result3) {
              if (err3) {
                console.log('err3', err3);
                // res.sendStatus(501);
                // error
              } else {
                // No error. Do we have speaker?
                var speakerId;
                if (result3.rows.length === 0) {
                  // Insert new speaker.
                  queryText = 'INSERT INTO "speakers" ("name", "play_id") VALUES ($1, $2) RETURNING "id" as id;';
                  db.query(queryText, [req.body.speaker, titleId], function(err4, result4) {
                    if (err4) {
                      // res.sendStatus(501);
                      console.log('err4', err4);
                    } else {
                      speakerId = result4.rows[0].id;
                    }
                  });
                } else {
                  speakerId = result3.rows[0].id;
                }

                console.log('speakerId is ', speakerId);


                //Finally we can insert the row.
                queryText = 'INSERT INTO "lines" ("index", "text", "speaker_id") VALUES ($1, $2, $3);';
                db.query(queryText, [req.body.index, req.body.text, speakerId], function(err5, result5){
                  done();
                  if (err5) {
                    console.log('err5', err5);
                    res.sendStatus(501);
                  } else {
                    res.sendStatus(201);
                  }
                });
              }
            });
            // res.send(result);
          }
        });
      }
    });
    // res.sendStatus(201);
  });

  function getPlay(play) {
    console.log('Get plays');

  }


  // Need functions to check:
  // - whether a title exists in PLAYS
  // - whether a speaker exists in SPEAKERS keyed to that PLAY
  // - create a TITLE
  // - create a SPEAKER
  // - create a LINE tied to SPEAKER and, via that, PLAY.



  var port = process.env.PORT || 4200;


  app.use(express.static('./server/public'));


  // Listen //
  app.listen(port, function(){
    console.log('Listening on port:', port);
  });
