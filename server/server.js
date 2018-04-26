
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











// Used to post all play Titles to DB:
// Nice won't let us post one that's there because we put in the UNIQUE constraint.
app.post('/playTitles', function(req, res) {
  pool.connect(function(err, db, done) {
    if (err) {
      console.log(err);
    } else {
      var queryText = 'INSERT INTO "plays" ("name") VALUES ($1);';
      db.query(queryText, [req.body.title], function (errorMakingQuery, result) {
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

// So odd, kind of works, but mysteriously stops occasionally. If you just keep restarting server you'll eventually get them all.....
// Post speaker names (I split them on the client side into like 30-size arrays for each play):
app.post('/speakerNames', function(req, res) {
  console.log(req.body);
  pool.connect(function(err, db, done) {

    var queryText;
    if (err) {
      console.log(err);
    } else {
      queryText = 'SELECT "id" FROM "plays" WHERE "plays"."name" = $1;';
      db.query(queryText, [req.body.title], function(err, result) {
        if (err) {
          console.log(err);
          res.sendStatus(501);
        } else {
          // console.log(result);
          var id = result.rows[0].id;

          queryText = 'SELECT * FROM "speakers" WHERE "name" = $1 AND "play_id" = $2;';
          db.query(queryText, [req.body.name, id], function (errorMakingQuery, result) {
            if (errorMakingQuery) {
              console.log('Error with country GET', errorMakingQuery);
              res.sendStatus(501);
            } else {
              if (result.rows.length === 0) {
                queryText = 'INSERT INTO "speakers" ("name", "play_id") VALUES ($1, $2);';
                db.query(queryText, [req.body.name, id], function (errorMakingQuery, result) {
                  done();
                  if (errorMakingQuery) {
                    console.log('Error with country GET', errorMakingQuery);
                    res.sendStatus(501);
                  } else {
                    res.sendStatus(201);
                  }
                });
              } else {
                console.log(result.rows);

                res.sendStatus(201);
              }

            }
          });
          // res.sendStatus(201);
        }
      });

    }
  });
});



app.post('/linesNames', function(req, res) {
  // console.log(req.body);
  pool.connect(function(err, db, done) {

    var queryText;
    if (err) {
      console.log(err);
    } else {
      queryText = 'SELECT "id" FROM "plays" WHERE "plays"."name" = $1;';
      db.query(queryText, [req.body.title], function(err, result) {
        if (err) {
          console.log('err with play get', err);
          res.sendStatus(501);
        } else {
          // console.log(result);

          var id = result.rows[0].id;

          queryText = 'SELECT "id" as id FROM "speakers" WHERE "name" = $1 AND "play_id" = $2;';
          db.query(queryText, [req.body.name, id], function (errorMakingQuery, result) {
            if (errorMakingQuery || result.rows.length == 0) {
              console.log('Error with speaker GET', errorMakingQuery);
              res.sendStatus(501);
              return;
            } else {
              console.log(result);


              var speakerId = result.rows[0].id;

              queryText = 'INSERT INTO "lines" ("index", "text", "speaker_id") VALUES ($1, $2, $3);';
              db.query(queryText, [req.body.index, req.body.line, speakerId], function (errorMakingQuery, result) {
                done();
                if (errorMakingQuery) {
                  console.log('Error with line POST', errorMakingQuery);
                  res.sendStatus(501);
                } else {
                  res.sendStatus(201);
                }
              });
              // console.log(result.rows);


            }
          });
          // res.sendStatus(201);
        }
      });

    }
  });
});































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
          // if (result.rows.length === 0) {
          //   // Insert new title. RETURN new id.
          //   queryText = 'INSERT INTO "plays" ("name") VALUES ($1) RETURNING "id" as id;';
          //   db.query(queryText, [req.body.title], function(err2, result2) {
          //     if (err2) {
          //       console.log('err2', err2);
          //       // res.sendStatus(501);
          //     } else {
          //       titleId = result2.rows[0].id;
          //     }
          //   });
          // } else {


          titleId = result.rows[0].id;
          // console.log(titleId);
          // }
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
