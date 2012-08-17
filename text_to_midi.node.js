var fs   = require('fs');
var Midi = require('jsmidgen');

var lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
var upperCaseLetters = lowerCaseLetters.toUpperCase();
var vowels           = "aeiou";

var notes = [
  'c2', 'd2', 'e2', 'f2', 'g2', 'a2', 'b2',
  'c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3',
  'c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4',
  'c5', 'd5', 'e5', 'f5', 'g5', 'a5', 'b5',
  'c6', 'd6', 'e6', 'f6', 'g6', 'a6', 'b6',
  'c7', 'd7', 'e7', 'f7', 'g7', 'a7', 'b7',
];

var pentatonicNotes = [
  'c1', 'd1', 'e1', 'g1', 'a1',
  'c2', 'd2', 'e2', 'g2', 'a2',
  'c3', 'd3', 'e3', 'g3', 'a3',
  'c4', 'd4', 'e4', 'g4', 'a4',
  'c5', 'd5', 'e5', 'g5', 'a5',
  'c6', 'd6', 'e6', 'g6', 'a6',
]

var lettersByFrequency = [
  "e", "t", "a", "o", "i", "n", "s", "h",
  "r", "d", "l", "c", "u", "m", "w", "f",
  "g", "y", "p", "b", "v", "k", "j", "x",
  "q", "z"
];

var drumNotes = {
  kick:    35,
  snare:   38,
  hat:     42,
  hatOpen: 46,
  ride:    51,
  highTom: 48
};

var characterToNote = function (c, scale) {
  var offset = lowerCaseLetters.indexOf(c);
  return scale[offset] || 'pause';
}

var characterToDrumNote = function (c) {
  // process.stdout.write(c);
  if (
    (upperCaseLetters.indexOf(c) != -1) ||
    (c == '!') || (c == '.') || (c == '?')
  ) {
    return drumNotes.kick;
  }
  if (vowels.indexOf(c.toLowerCase()) != -1) {
    return drumNotes[
      {
        e: 'hat',
        a: 'ride',
        i: 'snare',
        o: 'hatOpen',
        u: 'highTom'
      }[c.toLowerCase()]
    ];
  }
  return null;
}

var velocityFromLetterFrequency = function(letter) {
  return 20 + lettersByFrequency.indexOf(letter) * 3;
}

var pause = function(track, duration) {
  track.addNoteOff(0, 'c0', duration || 64);
}

TextToMidi = {};
TextToMidi.noobs = {}
TextToMidi.noobs.apply = function(text) {
  text = text.toLowerCase().substr(0, 127);
  var file  = new Midi.File();
  var track = new Midi.Track();
  file.addTrack(track);

  var channel  = 0;
  var duration = 8;

  for (var i = 0; i < text.length; i++) {
    var c        = text.charAt(i);
    var pitch    = characterToNote(c, notes);
    var velocity = velocityFromLetterFrequency(c);

    if (pitch == 'pause') {
      pause(track);
    } else {
      track.addNoteOn(channel, pitch, 0, velocity);
      track.addNoteOff(channel, pitch, duration, velocity);
    }
  }

  return file.toBytes();
};

TextToMidi.chords = {}
TextToMidi.chords.apply = function(text) {
  text = text.toLowerCase().substr(0, 127);
  var file  = new Midi.File();
  var track = new Midi.Track();
  file.addTrack(track);

  var channel  = 0;
  var duration = 8;
  var chord = [];
  var pitch, velocity, c;

  for (var i = 0; i < text.length; i++) {
    c = text.charAt(i);
    if (characterToNote(c, notes) == 'pause') {
      for (var j = 0; j < chord.length; j++) {
        pitch = chord[j];
        // velocity = velocityFromLetterFrequency(c);
        track.addNoteOn(channel, pitch, 0, 90);
      }
      // advance in time to the end of the chord
      track.addNoteOff(channel, 'c0', duration * chord.length); // note needed!?
      for (var j = 0; j < chord.length; j++) {
        pitch = chord[j];
        track.addNoteOff(channel, pitch, 0);
      }
      pause(track);
      chord = [];
    } else {
      if (chord.length == 0) {
        chord.push(characterToNote(c, notes));
      } else { // from second chord note
        note = notes[notes.indexOf(chord[0]) + ((chord.length % 3) * 2)];
        chord.push(note);
      }
    }
  }

  return file.toBytes();
};

TextToMidi.pentatonic = {}
TextToMidi.pentatonic.apply = function(text) {
  text = text.toLowerCase().substr(0, 127);
  var file  = new Midi.File();
  var track = new Midi.Track();
  file.addTrack(track);

  var channel  = 0;
  var duration = 8;

  for (var i = 0; i < text.length; i++) {
    var c        = text.charAt(i);
    var pitch    = characterToNote(c, pentatonicNotes);
    var velocity = velocityFromLetterFrequency(c);

    if (pitch == 'pause') {
      pause(track);
    } else {
      track.addNoteOn(channel, pitch, 0, velocity);
      track.addNoteOff(channel, pitch, duration, velocity);
    }
  }

  return file.toBytes();
};

TextToMidi.drums = {};
TextToMidi.drums.apply = function(text) {
  var file   = new Midi.File();
  var melody = new Midi.Track();
  var drums  = new Midi.Track();
  file.addTrack(melody);
  file.addTrack(drums);

  for (var i = 0; i < text.length; i++) {
    var c        = text.toLowerCase().charAt(i);
    var pitch    = characterToNote(c, pentatonicNotes);
    var velocity = velocityFromLetterFrequency(c);
    var drumNote = characterToDrumNote(text.charAt(i));

    if (pitch == 'pause') {
      pause(melody);
      pause(drums);
    } else {
      melody.addNoteOn(0, pitch, 0, velocity);
      if (drumNote != null) {
        drums.addNoteOn(0, drumNote, 0, velocity * 3);
        drums.addNoteOff(0, drumNote, 4);
        melody.addNoteOff(0, pitch, 4);
      } else {
        // melody.addNoteOff(0, pitch, 0);
      }
    }
  }

  return file.toBytes();
};

// ------------

Mode = process.env.mode || 'noobs';

if (process.env.mode == 'sandbox') {

} else {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(text) {
    out = TextToMidi[Mode].apply(text)
    process.stdout.write(out, 'binary');
  });
}