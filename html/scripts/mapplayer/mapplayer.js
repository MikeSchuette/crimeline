function MapPlayer(params) {
	//Init
	var frames = [];
	var curFrame = 0;
	var fps,
		decay, //how many frames a point will exist before fading out completely
		map,
		intervalId;
	var frameDrawCallback;

	setOptions(params);

	function setOptions(params) {
		if (params === undefined) {
			return;
		}

		if (params.fps === undefined && fps === undefined) {
			fps = 1;
		} else {
			fps = params.fps;
			if (intervalId) {
				//we are currently playing.
				this.pause();
				this.play();
			}
		}
		
		if (params.decay === undefined && decay === undefined) {
			decay = 5;
		} else {
			decay = params.decay;
		}

		if (params.onFrame !== undefined) {
			frameDrawCallback = params.onFrame;
		}
	}

	//Public Functions

	this.pushFrame = function(f) {
		frames.push(f);
	}

	this.drawNext = function() {
		if (frames.length == 0) {
			throw "No frames to draw";
		}

		if (curFrame + 1 > frames.length - 1) {
			//if next frame is off the end, wipe and go to beginning
			this.clear();
			curFrame = 0;
			this.draw();
			return;
		}

		var dimPer = -1/decay;
		if (frames.length < decay) {
			dimPer = -1/frames.length;
		}

		var dimStart = curFrame - decay;
		if (dimStart < 0) {
			dimStart = 0;
		}

		for (var i = dimStart; i <= curFrame; i++) {
			frames[i].setRelativeOpacity(dimPer);
		}

		curFrame++;
		this.draw();
	}

	this.draw = function() {
		if (frames.length == 0) {
			throw "No frames to draw";
		}
		frames[curFrame].setOpacity(1);
		frames[curFrame].draw();
		if (frameDrawCallback != undefined) {
			frameDrawCallback({
				exData: frames[curFrame].exData,
				index: curFrame - 0, //math to avoid ref
				count: this.numFrames(),
			});
		}
	}

	this.clear = function() {
		for (var i = 0; i < frames.length; i++) {
			frames[i].hide();
		}
	}

	this.numFrames = function() {
		return frames.length - 1;
	}

	this.jump = function(i) {
		if (i > frames.length - 1) {
			throw "jump() exceeded frame count";
		}
		this.clear();
		curFrame = i;
	}

	this.play = function() {
		var that = this;
		intervalId = setInterval(function() {that.drawNext()}, 1000 / fps);
	}

	this.pause = function() {
		if (this.isPlaying()) {
			clearInterval(intervalId);
			intervalId = undefined;
		}
	}

	this.isPlaying = function() {
		if (intervalId != undefined) {
			return true;
		}
	}

	this.togglePlay = function() {
		if (this.isPlaying()) {
			this.pause();
		} else {
			this.play();
		}
	}

}

