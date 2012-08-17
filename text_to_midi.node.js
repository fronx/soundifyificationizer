var fs   = require('fs');
var Midi = require('jsmidgen');

var lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";

var notes = [
  'c2', 'd2', 'e2', 'f2', 'g2', 'a2', 'b2',
  'c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3',
  'c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4',
  'c5', 'd5', 'e5', 'f5', 'g5', 'a5', 'b5',
  'c6', 'd6', 'e6', 'f6', 'g6', 'a6', 'b6',
  'c7', 'd7', 'e7', 'f7', 'g7', 'a7', 'b7',
];

var lettersByFrequency = [
  "e", "t", "a", "o", "i", "n", "s", "h",
  "r", "d", "l", "c", "u", "m", "w", "f",
  "g", "y", "p", "b", "v", "k", "j", "x",
  "q", "z"
];

var characterToNote = function (c) {
  var offset = lowerCaseLetters.indexOf(c);
  return notes[offset] || 'pause';
}

var velocityFromLetterFrequency = function(letter) {
  return 49 + lettersByFrequency.indexOf(letter) * 3;
}

TextToMidi = {};
TextToMidi.noobs = {}
TextToMidi.noobs.apply = function(text) {
  var file  = new Midi.File();
  var track = new Midi.Track();
  file.addTrack(track);

  var channel  = 0;
  var duration = 8;

  for (var i = 0; i < text.length; i++) {
    var c        = text.charAt(i);
    var pitch    = characterToNote(c);
    var velocity = velocityFromLetterFrequency(c);

    if (pitch == 'pause') {
      track.addNoteOff(channel, 'c0', duration, velocity); // note needed!?
    } else {
      track.addNoteOn(channel, pitch, 0, velocity);
      track.addNoteOff(channel, pitch, duration, velocity);
    }
  }

  return file.toBytes();
};

TextToMidi.chords = {}
TextToMidi.chords.apply = function(text) {
  var file  = new Midi.File();
  var track = new Midi.Track();
  file.addTrack(track);

  var channel  = 0;
  var duration = 8;
  var chord = [];
  var pitch, velocity, c;

  for (var i = 0; i < text.length; i++) {
    c = text.charAt(i);
    if (characterToNote(c) == 'pause') {
      track.addNoteOff(channel, 'c0', duration, velocity); // note needed!?
      chord = [];
    } else {
      if (chord.length == 0) {
        chord.push(characterToNote(c));
      } else { // from second chord note
        note = notes[notes.indexOf(chord[0]) + chord.length * 2];
        chord.push(note);
      }
      pitch    = chord[chord.length - 1];
      velocity = velocityFromLetterFrequency(c);

      track.addNoteOn(channel, pitch, 0, velocity);
      track.addNoteOff(channel, pitch, duration, velocity);
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
    process.stdout.write(
      TextToMidi[Mode].apply(
        text.toLowerCase().substr(0, 127)
      ),
      'binary'
    );
  });
}