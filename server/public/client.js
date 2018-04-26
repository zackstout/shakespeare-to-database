
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

var string = 'hello hi there';
var regex = /hi/;
var exists = regex.test(string); // returns boolean
console.log(exists);

var alsoExists = string.match(regex); // returns array of matches. Use g flag to match all matches. Use i flag to match case-insensitive.

// G flag and groups don't play nice together -- you need to bring in r.exec(s), and call it *until* it returns null.

// Can also use string.split(regex) and string.replace(regex, string)









var all = [];
// var allSpeakersAllPlays = {};

$(document).ready(function() {
  // allCsvs.forEach(function(play) {
  //   getPlay("csvs/" + play + ".csv");
  // });
  insertPlays();
  // getPlay('csvs/WintersTale.csv');


  // This, at least, works:
  // allCsvs.forEach(function(play) {
  //   $.ajax({
  //     type: "POST",
  //     url: "playTables",
  //     data: {
  //       play: play
  //     }
  //   });
  // });
});

// To avoid asynch problems we'll just do it one bit at a time:
function insertPlays() {
  // allCsvs.forEach(function(play) {
  //   getPlay("csvs/" + play + ".csv");
  //   // console.log(title);
  // });


  // I mean what we really want is something that will chain a bunch of promises. When the first play gets through all its lines, then start going through the second play.



  // I'm just flummoxed at this point. Why is it only inserting all the lines for some of the plays?!


  // Yeah, ended up brute forcing it.... By changing name every time. Yikes. At least we *seem* to have the DB now....

  // getPlay("csvs/WintersTale.csv");
  // getPlay("csvs/TitusAndronicus.csv");
  //
  // getPlay("csvs/TamingoftheShrew.csv");
  // getPlay("csvs/TheTempest.csv");
  // getPlay("csvs/TroilesandCressida.csv");

}


// One strategy would be to group up all the speakers for each play BEFORE going through lines. I don't know that this would add too much efficiency. Either way we have to look through the DB each time for that speaker's ID.


function getPlay(url) {
  var title;
  var allSpeakers = [];

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

      // var prevSpeaker = '';
      var first = line.indexOf(',');
      var last = line.lastIndexOf(',');
      var ind = line.slice(0, first);

      var rest = line.slice(first + 1);
      var second = rest.indexOf(',');
      var trueIndex = rest.slice(0, second);

      var text = line.slice(first + 1, last);
      text = text.slice(text.indexOf(',') + 1);
      var speaker = line.slice(last + 1);

      if (!allSpeakers.includes(speaker)) {
        // prevSpeaker = speaker;
        allSpeakers.push(speaker);
      }

      var firstDot = trueIndex.indexOf('.');
      var lastDot = trueIndex.lastIndexOf('.');
      var act = parseInt(trueIndex.slice(0, firstDot));
      var scene = parseInt(trueIndex.slice(firstDot + 1, lastDot));
      var lineNo = parseInt(trueIndex.slice(lastDot + 1));

      var info = {
        title: title,
        index: ind,
        trueIndex: trueIndex,
        act: isNaN(act) ? 0 : act,
        scene: isNaN(scene) ? 0 : scene,
        lineNo: isNaN(lineNo) ? 0 : lineNo,
        lineText: text,
        speaker: speaker,
        realTitle: url.slice(url.indexOf('/') + 1, url.indexOf('.'))
      };

      // console.log(info);

      all.push(info);

      // POST LINES TO DB:
      $.ajax({
          type: "POST",
          url: "allLines",
          data: info
        }).done(function(taco) {
          // console.log(taco);
        }).catch(function(err) {
          console.log(err);
        });


    }); // end forEach over lines

    console.log(all);
    allSpeakers.splice(0, 2);

    console.log(title, allSpeakers);


    // do stuff with all:

    // POST TITLES TO DB:
    // $.ajax({
    //   type: "POST",
    //   url: "playTitles",
    //   data: {
    //     title: title
    //   }
    // }).done(function(taco) {
    //   console.log(taco);
    // }).catch(function(err) {
    //   console.log(err);
    // });

    // POST SPEAKERS TO DB:
    // allSpeakers.forEach(function(speaker) {
    //   $.ajax({
    //     type: "POST",
    //     url: "speakerNames",
    //     data: {
    //       title: title,
    //       name: speaker
    //     }
    //   }).done(function(taco) {
    //     console.log(taco);
    //   }).catch(function(err) {
    //     console.log(err);
    //   });
    // });









    // do not forget to clear out:
    all = [];
    allSpeakers = [];


  }).catch(function(err) {
    console.log(err);
  });

  // return title;

}
















// chillin
