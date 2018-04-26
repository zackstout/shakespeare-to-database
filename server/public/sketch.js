
function setup() {

  $.ajax({
    type: "GET",
    url: "/onePlay/RichardIII"
  }).done(function(res) {
    console.log(res);

    let prevSpeaker = '';

    res.forEach(line => {
      // Is there a new speaker?
      if (line.speaker !== prevSpeaker) {
        createP(`${line.speaker}:`);
      }

      // clean text up:
      let cleaned = '';
      const regex = /[^"]+/; // ayy we got it
      if (line.lineText.length > 0) {
        cleaned = line.lineText.match(regex).join("");
      }

      createP(`${line.act}.${line.scene}.${line.lineNo} &emsp; ${cleaned}`);
      prevSpeaker = line.speaker;
    });

  }).catch(function(err) {
    console.log(err);
  });
}
