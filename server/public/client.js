
$(document).ready(function() {

  var all = [];

  // Phew, we now we the csv in its original user-friendly format..:
  console.log('jq');
  $.ajax({
    type: "GET",
    url: "csvs/Hamlet.csv",
    dataType: "text"
  }).done(function(data) {
    // OOOH duh we can't just split on this, because that will facture all lines containing a comma:
    var arr = data.split("\n"); // wow that was a shot in the dark.
    console.log(arr);
    arr.forEach(function(line) {
      // all.push(line.split())
      var first = line.indexOf(',');
      var last = line.lastIndexOf(',');
      var ind = line.slice(0, first);
      // var ind = line.slice(0, first); // index (we won't be using it)
      // console.log(ind);
      var rest = line.slice(first + 1);
      // console.log(rest);
      var second = rest.indexOf(',');

      var trueIndex = rest.slice(0, second);

      // var text = line.slice(0, last - ind.length());
      var text = line.slice(first + 1, last);
      text = text.slice(text.indexOf(',') + 1);
      var speaker = line.slice(last + 1);

      all.push({
        index: ind,
        trueIndex: trueIndex,
        text: text,
        speaker: speaker,
      });
    });

    console.log(all);
  }).catch(function(err) {
    console.log(err);
  });
});

// Line 8 is the title.

// Line 10 says '1.1.1'

// Ok it's already formatted in a friendly fashion: each row (indexed by unique ID) has a line index, a text, and a speaker.











// chillin
