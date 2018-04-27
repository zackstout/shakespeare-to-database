
function setup() {

  // $.ajax({
  //   type: "GET",
  //   url: "/imageRev"
  // }).done(function(resp) {
  //   console.log(resp);
  // }).catch(function(err) {
  //   console.log(err);
  // });

  let div;


  $('#subPlay').on('click', function() {


    var val = $('#playName').val();

    // $('body').empty();
    // div.remove();


    $.ajax({
      type: "GET",
      url: "/onePlay/" + val
    }).done(function(res) {
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

        for (let i=0; i < line.wordObjs.length; i++) {
          let span1 = createSpan(line.wordObjs[i].word + " ");
          let color1;
          switch(line.wordObjs[i].result) {
            case -3: color1 = color(255, 0, 0); break;
            case -2: color1 = color(170, 0, 0); break;
            case -1: color1 = color(100, 0, 0); break;
            case 0: color1 = color(255, 255, 255); break;
            case 1: color1 = color(0, 100, 0); break;
            case 2: color1 = color(0, 200, 0); break;
          }
          span1.style("background-color", color1);
          span1.parent(par);
          }
          prevSpeaker = line.speaker;
        });

      }).catch(function(err) {
        console.log(err);
      });
    });


  }
