var fs   = require('fs');
var Midi = require('jsmidgen');

TextUtils = {}
TextUtils.punctuation      = ".!?,"
TextUtils.lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
TextUtils.upperCaseLetters = TextUtils.lowerCaseLetters.toUpperCase();
TextUtils.vowels           = "aeiou";
TextUtils.lettersByFrequency = [
  "e", "t", "a", "o", "i", "n", "s", "h",
  "r", "d", "l", "c", "u", "m", "w", "f",
  "g", "y", "p", "b", "v", "k", "j", "x",
  "q", "z"
];
TextUtils.isLetter = function (c) {
  return TextUtils.lowerCaseLetters.indexOf(c.toLowerCase()) > -1;
}
TextUtils.isLowerCase = function (c) {
  return TextUtils.lowerCaseLetters.indexOf(c) > -1;
}
TextUtils.isUpperCase = function (c) {
  return TextUtils.lowerCaseLetters.indexOf(c) > -1;
}
TextUtils.isVowel = function (c) {
  return TextUtils.vowels.indexOf(c.toLowerCase()) > -1;
}
TextUtils.isPunctuation = function (c) {
  return TextUtils.punctuation.indexOf(c) > -1;
}
TextUtils.characterIndex = function (c) {
  return TextUtils.lowerCaseLetters.indexOf(c.toLowerCase());
}


Music = {}
Music.notes = [
  'c2', 'd2', 'e2', 'f2', 'g2', 'a2', 'b2',
  'c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3',
  'c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4',
  'c5', 'd5', 'e5', 'f5', 'g5', 'a5', 'b5',
  'c6', 'd6', 'e6', 'f6', 'g6', 'a6', 'b6',
  'c7', 'd7', 'e7', 'f7', 'g7', 'a7', 'b7',
];
Music.pentatonicNotes = [
  'c1', 'd1', 'e1', 'g1', 'a1',
  'c2', 'd2', 'e2', 'g2', 'a2',
  'c3', 'd3', 'e3', 'g3', 'a3',
  'c4', 'd4', 'e4', 'g4', 'a4',
  'c5', 'd5', 'e5', 'g5', 'a5',
  'c6', 'd6', 'e6', 'g6', 'a6',
];
Music.nonPentatonicNotes = [
  'f1', 'f2', 'f3', 'f4', 'f5', 'f6',
];
Music.drumNotes = {
  kick:    35,
  snare:   38,
  hat:     42,
  hatOpen: 46,
  ride:    51,
  highTom: 48
};

Lexer = {}
Lexer.getTokens = function (text) {
  return text.split('').map(function(c) {
    return {
      character:      c,
      characterIndex: TextUtils.characterIndex(c),
      isLetter:       TextUtils.isLetter(c),
      isLowerCase:    TextUtils.isLowerCase(c),
      isUpperCase:    TextUtils.isUpperCase(c),
      isVowel:        TextUtils.isVowel(c),
      isConsonant:    TextUtils.isLetter(c) && !TextUtils.isVowel(c),
      isPunctuation:  TextUtils.isPunctuation(c),
      isTag:          c == '#',
      isMention:      c == '@',
      isWhitespace:   c == ' ',
    };
  });
}

var maxLength = function(arrays) {
  var max = 0;
  arrays.forEach(function (array) {
    if (array.length > max) {
      max = array.length;
    };
  });
  return max;
};

var debug = function (x) {
  if (process.env.debug == '1') {
    process.stdout.write(x);
  }
};

TextToMidi = {};
TextToMidi.initTime = function (time, track) {
  if (track[time] == undefined) {
    track[time] = [];
  };
};
TextToMidi.addNote = function(time, track, pitch, duration, velocity) {
  TextToMidi.initTime(time, track);
  track[time].push({
    on:       true,
    pitch:    pitch,
    velocity: velocity,
  });
  TextToMidi.initTime(time + duration, track);
  track[time + duration].push({
    on:       false,
    pitch:    pitch,
  });
};

TextToMidi.toMidi = function (tracks) {
  var file = new Midi.File();
  tracks.forEach(function(track) {
    track.midiTrack = new Midi.Track();
    file.addTrack(track.midiTrack);
  });
  maxTime = maxLength(tracks);
  for (midiTime = 0; midiTime < maxTime; midiTime += 1) {
    tracks.forEach(function(track, trackIndex) {
      if (track[midiTime]) {
        track[midiTime].forEach(function (note) {
          if (note.on) {
            track.midiTrack.addNoteOn(0, note.pitch, 0, note.velocity);
          } else {
            track.midiTrack.addNoteOff(0, note.pitch);
          };
        });
      };
    });
    // advance in time by one
    tracks.forEach(function(track, trackIndex) {
      track.midiTrack.addNoteOff(0, 1, 1);
    });
  };
  return file.toBytes();
};

TextToMidi.drums = {};
TextToMidi.drums.apply = function(text) {
  var tracks = {
    drums:  [],
    melody: [],
  };
  var defaultLength = 16;
  var time = 0;
  Lexer.getTokens(text).forEach(function(token) {
    if (token.isWhitespace) {
      time += 64;
    } else {
      if (token.isUpperCase || token.isPunctuation) {
        TextToMidi.addNote(
          time,
          tracks.drums,
          Music.drumNotes.kick,
          defaultLength,
          20 + TextUtils.lettersByFrequency.indexOf(token.character) * 5
        )
      };
      if (token.isVowel) {
        TextToMidi.addNote(
          time,
          tracks.drums,
          Music.drumNotes[
            {
              e: 'hat',
              a: 'ride',
              i: 'snare',
              o: 'hatOpen',
              u: 'highTom'
            }[token.character.toLowerCase()]
          ],
          defaultLength,
          20 + TextUtils.lettersByFrequency.indexOf(token.character) * 5
        );
      };
      if (token.isConsonant) {
        TextToMidi.addNote(
          time + 4,
          tracks.melody,
          Music.notes[token.characterIndex],
          defaultLength / 2,
          20 + TextUtils.lettersByFrequency.indexOf(token.character) * 3
        )
      } else if (token.isLetter) {
        TextToMidi.addNote(
          time,
          tracks.melody,
          Music.pentatonicNotes[token.characterIndex],
          defaultLength,
          20 + TextUtils.lettersByFrequency.indexOf(token.character) * 3
        )
      };
      // advance global time for every letter
      // time += 1; // don't want that.
    };
  });
  var indexedTracks = [];
  indexedTracks[1]  = tracks.melody;
  indexedTracks[10] = tracks.drums;
  return indexedTracks;
};
TextToMidi.default = TextToMidi.drums;

// ------------

Mode = process.env.mode || 'default';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(text) {
  var tracks = TextToMidi[Mode].apply(text);
  debug(JSON.stringify(tracks));
  process.stdout.write(
    TextToMidi.toMidi(tracks), 'binary'
  );
});
