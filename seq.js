// requires context and playSound to exist in global scope
var playSequence = function (sequence, loops, tempo) {
  loops = loops || 1;
  tempo = tempo || 180; // BPM (beats per minute)

  var steps = sequence[0].steps.length;
  var eighthNoteTime = (60 / tempo) / 2;

  // delayed start
  var startTime = context.currentTime + 0.100;

  // Play x bars of the sequence:
  for (var loop = 0; loop < loops; loop++) {
    var time = startTime + loop * steps * eighthNoteTime;
    sequence.forEach(function (voice) {
      voice.steps.forEach( function (note, i) {
        if (note) {
          playSound(note, i * eighthNoteTime + time);
        }
      });
    });
  }
};

var sequentialize = function (voices, samples) {
  var sequence = [];
  for (voice in voices) {
    sequence.push({
      steps: voices[voice].steps.map(function(note) {
        if (note === 0) return 0;
        return samples[voices[voice].instrument][note-1];
      })
    });
  }

  return sequence;
};

// requires playSequence and sequentialize to exist in global scope
var play = function (voices, samples, loops, tempo) {
  playSequence(sequentialize(voices, samples), loops, tempo);
};

var voices =  {
  tiffany: {
    instrument: 'marimba',
    steps: [0,0,10,0,0,3,0,12]
  },
  jami: {
    instrument: 'marimba',
    steps: [0,0,8,0,0,0,11,9]
  },
  fronx: {
    instrument: 'drums',
    steps: [2,2,2,2,2,0,2,2]
  }
};
