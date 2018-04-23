
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

  getPlay('csvs/KingLear.csv');
});

// One strategy would be to group up all the speakers for each play BEFORE going through lines. I don't know that this would add too much efficiency. Either way we have to look through the DB each time for that speaker's ID.


function getPlay(url) {
  $.ajax({
    type: "GET",
    url: url,
    dataType: "text"
  }).done(function(data) {
    var arr = data.split("\n"); // wow that was a shot in the dark.
    // console.log(arr);
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
        index: ind,
        trueIndex: trueIndex,
        text: text,
        speaker: speaker,
      };

      all.push(info);

      // could just dispatch with 'all' altogether and just Post directly to DB.

      $.ajax({
        type: 'POST',
        url: "/postLine",
        data: info
      });
    });

    console.log(all);
    // do stuff with all:







    // do not forget to clear out:
    all = [];
  }).catch(function(err) {
    console.log(err);
  });
}
















// chillin
