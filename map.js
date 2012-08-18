var melodyNoteMap = {
  'c1':  0,
  'd1':  1,
  'e1':  2,
  'g1':  3,
  'a1':  4,
  'c2':  5,
  'd2':  6,
  'e2':  7,
  'g2':  8,
  'a2':  9,
  'c3': 10,
  'd3': 11,
  'e3': 12,
  'g3': 13,
  'a3': 14,
  'c4': 15,
  'd4':  1,
  'e4':  2,
  'g4':  3,
  'a4':  4,
  'c5':  5,
  'd5':  6,
  'e5':  7,
  'g5':  8,
  'a5':  9,
  'c6': 10,
  'd6': 11,
  'e6': 12,
  'g6': 13,
  'a6': 14
};

var drumNotesMap = {
  35:  0,
  38:  1,
  42:  4,
  46:  6,
  51:  9,
  48: 10
};

var melodySample = function (pitch) {
  return melodyNoteMap[pitch];
};

var drumsSample = function (pitch) {
  return drumNotesMap[pitch];
};
