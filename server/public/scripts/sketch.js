
let i = 0;

// Thanks StackOverflow:
$(window).scroll(function() {
  if($(window).scrollTop() + $(window).height() > $(document).height() - 5) {
    console.log("at bottom...");
    var val = $('#playName').val(); // this should really be part of the function
    getThreeHundredLines(val, i);
  }
});


// First of 3 main functions:
function drawChart(arr, markers) {
  // console.log(arr);
  const maxHuns = 7; // don't think we're using this anymore
  var canvas = document.getElementById('chart'); // odd, couldn't use jQuery syntax here...
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'lightblue';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Accounting for each play's max/min sentiment level:
  var min = Math.min.apply(null, arr);
  var max = Math.max.apply(null, arr);
  // console.log(min, max);

  var maxBound, minBound;
  for (var k=max; k < 50 + max; k++) {
    if (k % 50 === 0) {
      maxBound = k;
      break;
    }
  }
  for (var j=min; j > min - 50; j--) {
    if (j % 50 === 0) {
      minBound = j;
      break;
    }
  }
  console.log(maxBound, minBound);

  // Draw x-axis:
  ctx.beginPath();
  // ctx.moveTo(0, maxHuns*canvas.height/(maxHuns + 1));
  // ctx.lineTo(canvas.width, maxHuns*canvas.height/(maxHuns + 1));

  // needed this condition to deal with cases where negative value is higher, like Richard III:
  const absMax = Math.abs(maxBound) > Math.abs(minBound) ? maxBound : minBound; // must be better way to write this
  const absMin = Math.abs(maxBound) < Math.abs(minBound) ? maxBound : minBound; // must be better way to write this
  const posToNeg = Math.abs(absMax / absMin); // so if min is -150, max is 200, as with King Lear, we have 4/3: 4 positive segments to 3 negative ones.
  console.log(posToNeg);

  const ratio = Math.abs(maxBound) / (Math.abs(maxBound) + Math.abs(minBound));
  const axisHeight = canvas.height * ratio;
  ctx.moveTo(0, axisHeight);
  ctx.lineTo(canvas.width, axisHeight);
  ctx.stroke();

  // Draw ticks for act-changes:
  for (var key in markers) {
    ctx.beginPath();
    ctx.moveTo(markers[key] * canvas.width, axisHeight - 10);
    ctx.lineTo(markers[key] * canvas.width, axisHeight + 10);
    ctx.stroke();
  }

  // Trace path of sentiment with series of circles:
  for (var i=0; i < arr.length; i++) {
    var x = i * canvas.width / arr.length;

    const sentimentRange = maxBound - minBound;
    const relativeHeight = maxBound - arr[i];
    const absoluteHeight = relativeHeight * canvas.height / sentimentRange;

    // const sentimentRange = (maxHuns + 1) * 100;
    // const relativeHeight = maxHuns * 100 - arr[i];
    // const absoluteHeight = relativeHeight * canvas.height / sentimentRange;

    ctx.beginPath();
    // ctx.noStroke();
    ctx.fillStyle = 'green';
    ctx.arc(x, absoluteHeight, 2, 0, 2*PI);
    ctx.fill();
    // if (i % 100 == 0) console.log(arr[i]);
  }

}



// Second of 3 main functions:
function getSentiment(play) {
  $.ajax({
    type: "GET",
    url: "/playWords/" + play
  }).done(function(res) {
    console.log(res);
    let totalSentiment = 0;
    let totalSentiments = [];
    let prevAct = 0;
    let count = 0;
    let counts = [];

    res.forEach(row => {
      if (row.act !== prevAct) {
        counts.push(count);
      }
      prevAct = row.act;
      count++;

      // This does work:
      // if (row.speaker == 'MACBETH') {
        row.wordObjs.forEach(word => {
          totalSentiment += word.result;
          totalSentiments.push(totalSentiment);
          // console.log(totalSentiment);
        });
      // }

    });
    counts.splice(0, 1);

    var actMarkers = {};
    actMarkers.two = counts[0] / count;
    actMarkers.three = counts[1] / count;
    actMarkers.four = counts[2] / count;
    actMarkers.five = counts[3] / count;
    // console.log(actMarkers);

    console.log("words: ", totalSentiments.length);

    drawChart(totalSentiments, actMarkers);
  }).catch(function(err) {
    console.log(err);
  });
}



// Third of 3 main functions:
function getThreeHundredLines(play, num) {
  // only need to do the first time -- should fix:
  getSentiment(play);

  $.ajax({
    type: "GET",
    url: "/onePlay/" + play + '/' + num
  }).done(function(res) {
    i++;

    console.log(res);

    let prevSpeaker = '';
    // div = createDiv();
    let totalSentiment = 0;

    res.forEach(line => {
      // Is there a new speaker?
      if (line.speaker !== prevSpeaker) {
        let speak = createP(`${line.speaker}:`);
      }

      // clean text up: (Problem: this won't work if we're sending array of words from the server):
      let cleaned = '';
      const regex = /[^"]+/; // ayy we got it
      if (line.lineText.length > 0) {
        cleaned = line.lineText.match(regex).join("");
      }
      let par = createP(`${line.act}.${line.scene}.${line.lineNo} &emsp; `);

      // ${cleaned}
      // par.parent(div);
      // This seems to be too much for it: we need to be more efficient.
      // One idea is to do the on-scroll load more idea of Twitter and Facebook.

      // PROBLEM -- this isn't keeping out pruning of quote marks, and deletes all internal punctuation:
      for (let i=0; i < line.wordObjs.length; i++) {
        let span1 = createSpan(line.wordObjs[i].word);
        let span2 = createSpan(" ");
        let color1;
        switch(line.wordObjs[i].result) {
          case -4: color1 = color(255, 0, 0); break;
          case -3: color1 = color(200, 80, 70); break;
          case -2: color1 = color(255, 100, 0); break;
          case -1: color1 = color(255, 200, 100); break;
          case 0: color1 = color(255, 255, 255); break;
          case 1: color1 = color(200, 250, 100); break;
          case 2: color1 = color(100, 200, 0); break;
          case 3: color1 = color(0, 150, 0); break;
          case 4: color1 = color(0, 255, 0); break;
        }
        span1.style("background-color", color1);
        span1.parent(par);
        span2.parent(par);
        span1.color = color1; // nice, this works
        span1.mouseClicked(click);
        span1.mouseOver(hover);
        span1.mouseOut(unhover);

        // OOOh this will only get first 100 lines...
        totalSentiment += line.wordObjs[i].result;
        // console.log(totalSentiment);
      }
      prevSpeaker = line.speaker;
    });

  }).catch(function(err) {
    console.log(err);
  });
}




// Helper UI functions:
function hover() {
  this.style("background-color", "lightblue");
}

function unhover() {
  this.style("background-color", this.color);
}

function click() {
  const text = this.html();

  $.ajax({
    type: "GET",
    url: "https://wordsapiv1.p.mashape.com/words/" + text,
    headers: {
      "X-Mashape-Key": 'VJa8iy7VStmshL7HEX9YzgWHp1B8p1yqGkzjsnkGWHCKc68TRj',
      "X-Mashape-Host": 'wordsapiv1.p.mashape.com'
    }
  }).done(function(res) {
    console.log(res);

  }).catch(function(err) {
    console.log(err);
  });
}


function setup() {

  let div = createDiv();
  noCanvas();
  div.class("word");

  // New play button:
  $('#subPlay').on('click', function() {
    var val = $('#playName').val();

    i = 0; // reset this to 0 whenever user submits a new play.

    // PROBLEM: Need to figure out how to empty old play out:

    // $('body').empty();
    // div.remove();


    // To display lines:
    getThreeHundredLines(val, i);

    // getSentiment(val);
  });

  // Search button:
  $('#subSearch').on('click', function() {
    var searchVal = $('#search').val();
    var play = $('#playName').val();

    $.ajax({
      type: "GET",
      url: "searchPlay/" + searchVal + '/' + play
    }).done(function(res) {
      console.log(res);
    }).catch(function(err) {
      console.log(err);
    });
  });

  $('#subSpeakSearch').on('click', function() {
    var searchVal = $('#speakSearch').val();
    var play = $('#playName').val();

    $.ajax({
      type: "GET",
      url: "searchSpeakPlay/" + searchVal + '/' + play
    }).done(function(res) {
      console.log(res);
    }).catch(function(err) {
      console.log(err);
    });
  });

  $('#fullSearch').on('click', function() {
    var searchVal = $('#speakSearch').val();
    var play = $('#playName').val();
    var word = $('#search').val();

    $.ajax({
      type: "GET",
      url: "fullSearch/" + searchVal + '/' + play + '/' + word
    }).done(function(res) {
      console.log(res);
    }).catch(function(err) {
      console.log(err);
    });
  });


}
