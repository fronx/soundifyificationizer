var context = new webkitAudioContext();

var playSound = (function(context) {

	// have just one audio context
	// var context = new webkitAudioContext();

	var _playSound = function(buffer, at, velocity) {
		at = at || 0;
		var gain = velocity / 127 || 1;
		var source = context.createBufferSource(); // creates a sound source
		var gainNode = context.createGainNode(); // create a gain node
		source.buffer = buffer; // tell the source which sound to play
		gainNode.gain.value = gain;

		source.connect(gainNode);
		gainNode.connect(context.destination);
		source.noteOn(at); // play the source at time 'at'
	};

	return _playSound;

})(context);
