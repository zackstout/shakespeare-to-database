
let i = 0;

// Thanks StackOverflow:
$(window).scroll(function() {
  if($(window).scrollTop() + $(window).height() > $(document).height() - 5) {
    console.log("at bottom...");
    var val = $('#playName').val(); // this should really be part of the function
    getThreeHundredLines(val, i);
  }
});

function getThreeHundredLines(play, num) {
  $.ajax({
    type: "GET",
    url: "/onePlay/" + play + '/' + num
  }).done(function(res) {
    i++;

    console.log(res);

    let prevSpeaker = '';
    // div = createDiv();

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

      // Problem -- this isn't keeping out pruning of quote marks, and deletes all internal punctuation:
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
      }
      prevSpeaker = line.speaker;
    });

  }).catch(function(err) {
    console.log(err);
  });
}

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

  $('#subPlay').on('click', function() {
    var val = $('#playName').val();

    i = 0; // reset this to 0 whenever user submits a new play.
    // Need to figure out how to empty old play out:

    // $('body').empty();
    // div.remove();

    getThreeHundredLines(val, i);
  });

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


}
