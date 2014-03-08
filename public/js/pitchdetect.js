//Thanks to Chris Wilson's PitchDetect https://github.com/cwilso/PitchDetect

/*global navigator, AudioContext, Uint8Array*/
(function (exports) {
  var NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A",
    "A#", "B"
  ];
  var audioContext = new AudioContext();

  function getUserMedia(dictionary, callback) {
    try {
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      navigator.getUserMedia(dictionary, callback, function (err) {
        console.log('Stream generation failed.');
      });
    } catch (err) {
      console.log('getUserMedia throw exception: ', err.message);
    }
  }

  function requestAnimationFrame(callback) {
    window.requestAnimationFrame = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame;
    return window.requestAnimationFrame(callback);
  }

  function noteFromPitch(pitch) {
    var noteNum = 12 * (Math.log(pitch / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
  }

  function frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function centsOffFromPitch(frequency, note) {
    return Math.floor(1200 * Math.log(frequency / frequencyFromNoteNumber(
      note)) / Math.log(2));
  }

  function autoCorrelate(buf, sampleRate) {
    var MIN_SAMPLES = 4; // corresponds to an 11kHz signal
    var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
    var SIZE = 1000;
    var best_offset = -1;
    var best_correlation = 0;
    var rms = 0;

    if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES)) {
      return -1; // Not enough data
    }

    for (var i = 0; i < SIZE; i++) {
      var val = (buf[i] - 128) / 128;
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    for (var offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
      var correlation = 0;

      for (var j = 0; j < SIZE; j++) {
        correlation += Math.abs(((buf[j] - 128) / 128) -
          ((buf[j + offset] - 128) / 128));
      }
      correlation = 1 - (correlation / SIZE);
      if (correlation > best_correlation) {
        best_correlation = correlation;
        best_offset = offset;
      }
    }
    if ((rms > 0.01) && (best_correlation > 0.01)) {
      // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
      return sampleRate / best_offset;
    }
    return -1;
    //        var best_frequency = sampleRate/best_offset;
  }

  function Detector() {
    this.turnOn = false;
    this.pitch;
    this.volume;
    this.note;
    this.noteString = '';
    this.detune = 0;
    this.analyserPitch = null;
    this.analyserVolume = null;
    this.bufPitch = new Uint8Array(2048);
    this.bufVolume = new Uint8Array(64);
    this.requestId = null;
    this.mediaStreamSource = null;
    this.audioStream = null;
  }

  Detector.prototype.startLiveInput = function () {
    getUserMedia({
      audio: true
    }, this.gotStream.bind(this));
    this.turnOn = true;
  };

  Detector.prototype.gotStream = function (stream) {
    //make it for the peer call
    this.audioStream = stream;
    // Create an AudioNode from the stream.
    this.mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to the destination.
    this.analyserPitch = audioContext.createAnalyser();
    this.analyserPitch.fftSize = 2048;
    this.mediaStreamSource.connect(this.analyserPitch);

    this.analyserVolume = audioContext.createAnalyser();
    this.analyserVolume.fftSize = 64;
    this.mediaStreamSource.connect(this.analyserVolume);

    this.updatePitch();
    this.getAverageVolume();
  };

  Detector.prototype.getAverageVolume = function () {
    var value = 0;
    this.analyserVolume.getByteTimeDomainData(this.bufVolume);
    for (var i = 0; i < this.bufVolume.length; i++) {
      value += this.bufVolume[i];
    }
    this.volume = value / this.bufVolume.length;
    requestAnimationFrame(this.getAverageVolume.bind(this));
  };

  Detector.prototype.updatePitch = function () {
    var cycles = [];
    this.analyserPitch.getByteTimeDomainData(this.bufPitch);
    var ac = autoCorrelate(this.bufPitch, audioContext.sampleRate);
    if (ac !== -1) {
      this.pitch = ac;
      this.note = noteFromPitch(ac);
      this.detune = centsOffFromPitch(ac, this.note);
      this.noteString = NOTE_STRINGS[this.note % 12];
    }
    requestAnimationFrame(this.updatePitch.bind(this));
  };

  exports.pitchDetector = new Detector();
  exports.pitchDetector.startLiveInput();
})(this);