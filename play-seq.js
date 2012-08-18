var paths = {
	marimba: [
		'ogg/woody_1.ogg',
		'ogg/woody_2.ogg',
		'ogg/woody_3.ogg',
		'ogg/woody_4.ogg',
		'ogg/woody_5.ogg',
		'ogg/woody_6.ogg',
		'ogg/woody_7.ogg',
		'ogg/woody_8.ogg',
		'ogg/woody_9.ogg',
		'ogg/woody_10.ogg',
		'ogg/woody_11.ogg',
		'ogg/woody_12.ogg',
		'ogg/woody_13.ogg',
		'ogg/woody_14.ogg',
		'ogg/woody_15.ogg',
		'ogg/woody_16.ogg'
	],
	drums: [
		'ogg/drums_1.ogg',
		'ogg/drums_2.ogg',
		'ogg/drums_3.ogg',
		'ogg/drums_4.ogg',
		'ogg/drums_5.ogg',
		'ogg/drums_6.ogg',
		'ogg/drums_7.ogg',
		'ogg/drums_8.ogg',
		'ogg/drums_9.ogg',
		'ogg/drums_10.ogg',
		'ogg/drums_11.ogg',
		'ogg/drums_12.ogg',
		'ogg/drums_13.ogg',
		'ogg/drums_14.ogg',
		'ogg/drums_15.ogg',
		'ogg/drums_16.ogg'
	]
};

var makeDiv = function (i, sound, prefix, target) {
	var div = document.createElement('div');
	div.className = 'key';
	div.style.backgroundColor = '#'+ prefix + (4 * i + 18);
	div.addEventListener('click', function () {
		playSound(sound);
	});
	target.appendChild(div);
};

var makeHolder = function (instrument) {
	var div = document.createElement('div');
	document.body.appendChild(div);
	return div;
};

var ready = function (instrument, prefix) {
	return function (sounds) {
		var target = makeHolder(instrument);
		sounds.forEach(function (sound, i) {
			setTimeout(function () {
				makeDiv(i, sound, prefix, target);
			}, 30 * i);
		});
		samples[instrument] = sounds;
	};
}

var samples = {};

loadSounds(paths['marimba'], ready('marimba', 'ff00'));
loadSounds(paths['drums'], ready('drums', '00ff'));

var playSong = function (song, loops, tempo) {
  loops = loops || 1;
  tempo = tempo || 180 * 32; // BPM (beats per minute)

  var melody = song[1];
  var drums = song[10];

  var steps = Math.max(melody.length, drums.length);
  var eighthNoteTime = (60 / tempo) / 2;

  // delayed start
  var startTime = context.currentTime + 0.100;

  // Play x bars of the sequence:
  for (var loop = 0; loop < loops; loop++) {
    var time = startTime + loop * steps * eighthNoteTime;

    melody.forEach(function(beat, i) {
      if (beat) {
        beat.forEach(function (note) {
          var sample = samples.marimba[melodySample(note.pitch, note.velocity)];
          playSound(sample, i * eighthNoteTime + time);
        });
      }
    });

    drums.forEach(function(beat, i) {
      if (beat) {
        beat.forEach(function (note) {
          var sample = samples.drums[drumsSample(note.pitch)];
          //playSound(sample, i * eighthNoteTime + time, note.velocity * .1);
        });
      }
    });
  }
};


