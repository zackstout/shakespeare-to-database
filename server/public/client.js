
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

var all = [];

$(document).ready(function() {
  // allCsvs.forEach(function(play) {
  //   getPlay("csvs/" + play + ".csv");
  // });
  insertPlays();
  // getPlay('csvs/WintersTale.csv');
});

// To avoid asynch problems we'll just do it one bit at a time:
function insertPlays() {
  allCsvs.forEach(function(play) {
    getPlay("csvs/" + play + ".csv");
    // console.log(title);
  });
}

function insertSpeakers() {

}

function insertLines() {

}








// One strategy would be to group up all the speakers for each play BEFORE going through lines. I don't know that this would add too much efficiency. Either way we have to look through the DB each time for that speaker's ID.


function getPlay(url) {
  var title;

  $.ajax({
    type: "GET",
    url: url,
    dataType: "text"
  }).done(function(data) {
    var arr = data.split("\n"); // wow that was a shot in the dark.
    // console.log(arr);
    var titleprep = arr[2].slice(arr[2].indexOf(',') + 1);
    title = titleprep.slice(titleprep.indexOf(',') + 1, titleprep.length - 1);
    console.log(title);

    arr.forEach(function(line) {
      var first = line.indexOf(',');
      var last = line.lastIndexOf(',');
      var ind = line.slice(0, first);

      var rest = line.slice(first + 1);
      var second = rest.indexOf(',');
      var trueIndex = rest.slice(0, second);

      var text = line.slice(first + 1, last);
      text = text.slice(text.indexOf(',') + 1);
      var speaker = line.slice(last + 1);

      var info = {
        title: title,
        index: ind,
        trueIndex: trueIndex,
        text: text,
        speaker: speaker,
      };

      all.push(info);



      // *****Just send info along with TITLE and send the whole array for each CSV to the server!
      // Eh whatever, we can just go line by line, I don't think it matters too much either way. It will be more inefficient, but we only have to do it once.



      // Dispatch with 'all' altogether and just Post directly to DB.


      // $.ajax({
      //   type: "POST",
      //   url: "/postLine",
      //   data: info
      // }).done(function(res) {
      //   console.log(res);
      // }).catch(function(err) {
      //   console.log(err);
      // });



      // $.ajax({
      //   type: 'GET',
      //   url: "/title/" + info.title,
      // }).done(function(res1) {
      //   // console.log(res);
      //
      //   // Do we have the play yet?
      //   var playId;
      //   var speakerId;
      //
      //   if (res1.length === 0) {
      //     $.ajax({
      //       type: 'POST',
      //       url: "/title",
      //       data: info.title
      //     }).done(function(res2) {
      //       console.log(res2);
      //       playId = res2;
      //
      //       // we now have playId.
      //       $.ajax({
      //         type: 'GET',
      //         url: "/speaker/" + info.speaker + "/" + playId
      //       }).done(function(res3) {
      //         console.log(res3);
      //         if (res3.length === 0) {
      //           $.ajax({
      //             type: "POST",
      //             url: "/speaker",
      //             data: {
      //               name: info.speaker,
      //               play_id: playId
      //             }
      //           }).done(function(res4) {
      //             speakerId = res4;
      //           });
      //         } else {
      //           speakerId = res3[0].id;
      //         }
      //       });
      //     });
      //   } else {
      //     console.log(res1);
      //     playId = res1[0].id;
      //
      //     // we now have playId.
      //     $.ajax({
      //       type: 'GET',
      //       url: "/speaker/" + info.speaker + "/" + playId
      //     }).done(function(res5) {
      //       console.log(res5);
      //       if (res5.length === 0) {
      //         $.ajax({
      //           type: "POST",
      //           url: "/speaker",
      //           data: {
      //             name: info.speaker,
      //             play_id: playId
      //           }
      //         }).done(function(res6) {
      //           speakerId = res6;
      //         });
      //       } else {
      //         speakerId = res5[0].id;
      //       }
      //     });
      //   }
      //
      //
      //
      //   // we now have SpeakerId.
      //   console.log(playId, speakerId);
      // });



    }); // end forEach over lines

    console.log(all);
    // do stuff with all:


    $.ajax({
      type: "POST",
      url: "playTitles",
      data: {
        title: title
      }
    }).done(function(taco) {
      console.log(taco);
    }).catch(function(err) {
      console.log(err);
    });



    // do not forget to clear out:
    all = [];


  }).catch(function(err) {
    console.log(err);
  });

  // return title;

}
















// chillin
