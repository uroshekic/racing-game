/*
 * Car Object
 */
function Car (x, y, alfa, color, maxVelocity, radius) {
	this.x = x;					// X coordinate
	this.y = y;					// Y coordinate
	this.alfa = alfa == null ? Math.PI / 2 : alfa;	// Angle
	this.v = 0;					// Velocity
	this.v0 = 0.5;				//

	this.a = 1.025;				// Acceleration pixels/frame^2
	this.maxVelocity = maxVelocity == null ? 4 : maxVelocity;	// Maximum velocity

	this.color = color == null ? '#4A96AD' : color;	// Car's color
	this.r = radius == null ? 10 : radius;			// Radius

	/* Car's representation */
	this.repr = function (c, x, y) {
		c.fillStyle = this.color;
		c.beginPath();
		c.arc(Math.round(x), Math.round(y), this.r, -1 * Math.PI / 2 - this.alfa, Math.PI / 2 - this.alfa);
		c.fill();
	}

	this.reprShadow = function(c, x, y, alfa) {
		c.globalAlpha = 0.5;
		c.fillStyle = '#999';
		c.beginPath();
		c.arc(Math.round(x), Math.round(y), this.r, -1 * Math.PI / 2 - alfa, Math.PI / 2 - alfa);
		c.fill();
		c.globalAlpha = 1;
	}

	/* Collision algorithms */
	/*
	// Prototype
	this.collision = function () {
		return !onTheRoad(this.x, this.y);
	};
	// */

	// /*
	// Bounding half-circle
	this.collision = function () {
		if (this.x < 0 || this.y < 0 || this.x > track.w - 1 || this.y > track.h - 1) return false;
		if (!onTheRoad(this.x, this.y)) return true;

		var x, y;
		for (var r = this.r; r > 0; r--) {
			for (var alfa = -1 * Math.PI / 2; alfa < Math.PI / 2; alfa += Math.PI / 10) {
				x = ~~(r * Math.cos(alfa + this.alfa));
				y = ~~(r * Math.sin(alfa - this.alfa));
				if ((this.x + x < 0) || (this.y + y < 0) || (this.x + x > track.w - 1) || (this.y + y > track.h - 1)) continue;
				if (!onTheRoad(this.x + x, this.y + y)) return true;
			}
		}
		return false;
	}
	// */

	/*
	// Checks all pixels in a rectangle/square (bounding box)
	this.collision = function () {
		for (var i = -1 * this.r + 1; i < this.r - 1; i += 1) {
			for (var j = -1 * this.r; j <this.r; j += 1) {
				if ((this.x + i < 0) || (this.y + j < 0) || (this.x + i > track.w - 1) || (this.y + j > track.h - 1)) continue;
				if (!onTheRoad(this.x + i, this.y + j)) return true;
			}
		}
		return false;
	};
	// */

	// Checkpoints
	this.checkpoints = [ false, false ];
	this.allCheckpoints = function () {
		for (var i = 0; i < this.checkpoints.length; i++) {
			if (!car.checkpoints[i]) return false;
		}
		return true;
	}
	this.resetCheckpoints = function () {
		for (var i = 0; i < this.checkpoints.length; i++) this.checkpoints[i] = false;
	}

	this.shadow = [];
	this.newShadow = [];
};

/*
 * Track Object
 */
function Track (name, filename, width, height, x, y, alfa, teleporter, checkpoints) {
	this.name = name;
	filename = 'tracks/' + filename;
	this.filename = filename + '.png';
	this.filenameHidden = filename + '_h.png';
	this.w = width;		// Track size
	this.h = height;
	this.x = x; 	// Car's initial position
	this.y = y;
	this.alfa = alfa == null ? Math.PI / 2 : alfa;
	this.teleporter = teleporter == null ? function (carObject) { } : teleporter; // A function to simulate infinite tracks, teleporters, ...

	/* Checkpoints
	 * Every track needs (exactly!) 2 checkpoints and a start (3 checkpoints in total). That way players can't cheat. 
	 * Each checkpoint must be a rectangular area.
	 * Those 3 areas must NOT intersect! The 3 checkpoints must follow in this order (in the direction of driving): start, checkpoint 1, checkpoint 2. 
	 */
	this.checkpoints = checkpoints == null ? null : checkpoints;
};

/*
 * Track's teleporter function which simulates an infinite track
 */
function infiniteTrack(carObject) {
	if (carObject.x < 0) carObject.x += track.w;
	if (carObject.y < 0) carObject.y += track.h;
	if (carObject.x > track.w) carObject.x %= track.w;
	if (carObject.y > track.h) carObject.y %= track.h;
}

/*
 * Main frame
 */
function frame () {
	if (!trackLoaded) {
		wipeCanvas();
		displayText('Loading...', 200, 100);
		setTimeout(frame, 500);	
		return;
	}

	if (show === 'game') {
		// Backup
		var x = car.x, 
			y = car.y;

		if (keyDown('UP')) {
			if (car.v > 0) {
				car.v *= car.a; // Accelerate
			} else if (car.v < 0) {
				car.v *= 1 - (car.a - 1) * 5;
			} else {
				car.v = car.v0;
			}
		} else if (keyDown('DOWN')) {
			if (car.v < 0) {
				car.v *= car.a;
			} else if (car.v > 0) {
				car.v *= 1 - (car.a - 1) * 5;
			} else {
				car.v = -1 * car.v0;
			}
		} else {
			car.v *= 0.98; // Friction
		}

		// Brakes
		if (keyDown('SPACE')) {
			car.v *= Math.pow(1 - (car.a - 1), 3);
		}

		if (Math.abs(car.v) < 0.2) car.v = 0;

		// Speed limit
		if (car.v > 0) {
			if (car.v > car.maxVelocity) car.v = car.maxVelocity;
		} else if (car.v < 0) {
			if (car.v < -1 / 2 * car.maxVelocity) car.v = -1 / 2 * car.maxVelocity;
		}

		// Steering
		if (!strictSteering || car.v > 0) {
			if (keyDown('LEFT')) {
				car.alfa += steeringAngle;
			} else if (keyDown('RIGHT')) {
				car.alfa -= steeringAngle;
			}
		}
		if (car.alfa > 2 * Math.PI) car.alfa %= 2 * Math.PI;

		// Update car's position
		car.x += car.v * Math.cos(car.alfa);
		car.y -= car.v * Math.sin(car.alfa);

		// Special effects
		track.teleporter(car);

		// Collision
		if (car.collision()) {
			car.x = x;
			car.y = y;
			car.v = -1 * car.v / 1.5;
		}

		// Checkpoints
		if (track.checkpoints != null) {
			if (insideRectangle(car.x, car.y, track.checkpoints['1'])) { // Checkpoint 1
				if (car.checkpoints[0] && car.checkpoints[1]) {
					car.resetCheckpoints();
				}
				if (!car.checkpoints[0]) car.checkpoints[0] = true;
			} else if (insideRectangle(car.x, car.y, track.checkpoints['2'])) { // Checkpoint 2
				if (car.checkpoints[0]) {
					if (!car.checkpoints[1]) car.checkpoints[1] = true;
				} else {
					car.resetCheckpoints();
				}
			} else if (insideRectangle(car.x, car.y, track.checkpoints['start'])) { // Start
				if (car.allCheckpoints()) newLap();

				car.resetCheckpoints();
			}
		}

		car.newShadow.push([ car.x, car.y, car.alfa ]);
	} else if (show === 'menu') {
		// Nothing to do here
	} else if (show === '321') {
		var diff = (new Date()).getTime() - countdown;
		if (diff >= 3000) {
			time = (new Date()).getTime();
			lapTime = time;

			countdown = null;
			show = 'game';
		}
	} else {
		return;
	}

	// Track's offset
	var trackOffsetX = car.x - cNode.width / 2,
		trackOffsetY = car.y - cNode.height / 2;

	// Fix offset
	if (trackOffsetX < 0) trackOffsetX = 0;
	if (trackOffsetX > track.w - cNode.width) trackOffsetX = track.w - cNode.width;
	if (trackOffsetY < 0) trackOffsetY = 0;
	if (trackOffsetY > track.h - cNode.height) trackOffsetY = track.h - cNode.height;

	// Car's relative position to canvas
	var rX = car.x - trackOffsetX,
		rY = car.y - trackOffsetY;

	/* REDRAW EVERYTHING */
	// Redraw map
	wipeCanvas();
	c.drawImage(trackImg, -trackOffsetX, -trackOffsetY);

	// Shadow
	if (car.shadow.length > 0) {
		var shadow = car.shadow.shift();
			car.reprShadow(c, shadow[0] - trackOffsetX, shadow[1] - trackOffsetY, shadow[2]);
	}

	// Draw
	car.repr(c, rX, rY);

	if (show === 'game') {
		// GO!
		if ((new Date()).getTime() - time < 3000) {
			displayText('GO!', 100, 60);
		}
	} else if (show === 'menu') {
		displayText('Press [ENTER] to start!', 400, 60);
	} else if (show === '321') {
		if (diff < 1000) {
			displayText('3', 100, 60);
		} else if (diff < 2000) {
			displayText('2', 100, 60);
		} else if (diff < 3000) {
			displayText('1', 100, 60);
		}
	}

	f++;
	requestAnimationFrame(frame);
}

/*
 * New lap
 */
function newLap () {
	var t = (new Date()).getTime();
	var n = t - lapTime;
	lapTimes.push(n);
	lapTime = t;
	nrLaps++;

	car.shadow = car.newShadow;
	car.newShadow = [];

	lapTimesList.innerHTML += '<li>' + (n / 1000).toFixed(2) + '</li>';
}

/*
 * Load track
 */
function loadTrack(id) {
	if (id < 0 || id >= tracks.length) return false;
	trackLoaded1 = false, trackLoaded2 = false, trackLoaded = false;
	track = tracks[id];

	// Car
	car = new Car(0, 0);
	car.x = track.x;
	car.y = track.y;
	car.alfa = track.alfa;
	car.shadow = [];
	car.newShadow = [];

	if (track.name == 'Track 1') {
		car.r = 14;
		car.maxVelocity += 1;
	}

	// Remove old img node
	var node = document.getElementById('track');
	var parent = node.parentNode;
	parent.removeChild(node);
	// Create new
	node = document.createElement('img');
	node.setAttribute('id', 'track');
	node.setAttribute('onload', 'trackLoaded1 = true;');
	node.setAttribute('src', track.filename);
	parent.appendChild(node);

	// Remove old img node (hidden canvas)
	node = document.getElementById('hiddenTrack');
	parent.removeChild(node);
	// Create new
	node = document.createElement('img');
	node.setAttribute('id', 'hiddenTrack');
	node.setAttribute('onload', 'trackLoaded2 = true;');
	node.setAttribute('src', track.filenameHidden);
	parent.appendChild(node);

	cNode = document.getElementById('raceTrack');
	c = cNode.getContext('2d');

	hiddenCanvas = document.getElementById('hiddenCanvas')
	hiddenCanvas.width = track.w;
	hiddenCanvas.height = track.h;
	hiddenCanvas = hiddenCanvas.getContext('2d');

	trackImg = document.getElementById('track');
	hiddenTrackImg = document.getElementById('hiddenTrack');
	loadTrackFinish();

	// UI
	show = 'menu';

	// Reset
	nrLaps = 0;
	timeElement.innerHTML = '0.00';
	lapTimeElement.innerHTML = '0.00';
	nrLapsElement.innerHTML = '0';
	speedElement.innerHTML = '0.00';
	lapTimesList.innerHTML = '';
	resetFPS();

	document.getElementById('raceTrack').focus();
}

/*
 * loadTrack's helper method
 */
function loadTrackFinish () {
	if (trackLoaded1 && trackLoaded2) {
		hiddenCanvas.drawImage(hiddenTrackImg, 0, 0);

		// Pixels
		trackImageData = []; // Contains pixel data of road's position
		var k = hiddenCanvas.getImageData(0, 0, track.w, track.h).data;
		var j;
		for (var i = 0; i < k.length / 4; i += 1) {
			j = 4 * i;
			if (k[j] === 255 && k[j + 1] === 255 && k[j + 2] === 255) {
				trackImageData.push(false);
			} else {
				trackImageData.push(true);
			}
		}

		trackLoaded = true;
	} else {
		setTimeout(loadTrackFinish, 200);
	}
}

/*
 * Check whether given coordinates lie on the road.
 */
function onTheRoad (x, y) {
	var i = Math.round(y) * track.w + Math.round(x);
	return trackImageData[i];
}

/*
 * Event handler for selecting tracks
 */
function selectTrack () {
	var id = document.getElementsByName('selectTrack')[0].value;
	loadTrack(id);
}

/*
 * Display text in a box
 */
function displayText (text, x, y, fontSize) {
	fontSize = fontSize == null ? 32 : fontSize;

	c.textAlign = "center";
	c.fillStyle = '#EEE';
	c.strokeStyle = '#666';
	c.globalAlpha = 0.25;
	var x0 = Math.round(cNode.width / 2 - x / 2);
	var y0 = Math.round(cNode.height / 2 - y / 2);
	c.fillRect(x0, y0, x, y - Math.round(fontSize / 2));
	c.strokeRect(x0, y0, x, y - Math.round(fontSize / 2));
	c.globalAlpha = 1;

	c.font = fontSize + "px Arial";
	c.fillStyle = '#000';
	c.fillText(text, Math.round(cNode.width / 2), Math.round(cNode.height / 2));
}

/*
 * Wipe canvas
 */
function wipeCanvas () {
	var temp = c.fillStyle;
	c.fillStyle = "#FFF";
	c.fillRect(0, 0, cNode.width, cNode.height);
	c.fillStyle = temp;
}

/*
 * Reset fps counter
 */
function resetFPS () {
	f = 0;
	fpsTime = (new Date()).getTime();
}

/*
 * Return whether given key is pressed
 */
function keyDown (key) { 
	return keys[key];
}

/*
 * Event handler method
 */
function keyHandler (e) {
	//console.log(e.type + ' ' + e.keyCode);

	if (!trackLoaded) return;

	if (show === 'menu') {
		if (e.keyCode === 13) { // New game
			show = '321';
			countdown = (new Date()).getTime();
		}
	} else if (show === 'game') { // Pause
		if (e.keyCode === 80) {

		}
	} else if (show === 'pause') { // Unpause
		if (e.keyCode === 80) {

		}
	}

	if ((e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode === 32) {
		keys[keyCodes[e.keyCode]] = e.type === 'keydown';
		e.preventDefault();
	}
}

/*
 * Return whether coordinates (x, y) lie inside rectangle.
 */
function insideRectangle (x, y, array) {
	return (x > array[0] && x < array[1] && y > array[2] && y < array[3]);
}

var tracks = [
				new Track('Track 0', 'track0', 1000, 600, 942, 450, null, null, {'start' : [875, 995, 425, 435], '1' : [875, 995, 250, 260], '2' : [875, 995, 100, 110] }),
				new Track('Track 1', 'track', 1500, 800, 770, 80, 0, null, { 'start' : [790, 800, 5, 160], '1' : [850, 860, 5, 160], '2' : [900, 910, 5, 160] }),
				new Track('Speedway', 'speedway', 1000, 600, 925, 300, null, null, { 'start' : [835, 990, 290, 300], '1' : [510, 540, 10, 200], '2' : [480, 490, 400, 559] }),
				new Track('Infinity', 'infinity', 1000, 600, 550, 250, null, infiniteTrack)
			 ],
	track, c, cNode, hiddenCanvas, trackImg,
	car = new Car(0, 0),
	trackLoaded1, trackLoaded2, trackLoaded, 
	trackImageData,
	keyCodes = { 37 : 'LEFT', 38 : 'UP', 39 : 'RIGHT', 40 : 'DOWN', 32 : 'SPACE' },
	keys = {
			'UP' : false,
			'DOWN' : false,
			'LEFT' : false,
			'RIGHT' : false,
			'SPACE' : false
	},
	strictSteering = false, 		// You can only steer while driving
	steeringAngle = Math.PI / 60;

// UI
var show = 'menu', // menu, 321, game
	countdown,
	speedElement = document.getElementById('speed'),
	timeElement = document.getElementById('time'),
	lapTimeElement = document.getElementById('lapTime'),
	nrLapsElement = document.getElementById('nrLaps'),
	lapTimesList = document.getElementById('lapTimes'),
	time = 0, lapTime = 0, nrLaps = 0, lapTimes = [];

// FPS
var f, fpsTime, fpsElement = document.getElementById('fps');

// Debug
var debug = false;

// Load track
loadTrack(1);

// Select track
var selected, 
	e = document.getElementsByName('selectTrack')[0];
e.innerHTML = '';
for (var i = 0; i < tracks.length; i++) {
	selected = track.filename == tracks[i].filename ? ' selected' : '';
	e.innerHTML += '<option value="' + i + '"' + selected + '>' + tracks[i].name + '</option>';
}

// Display FPS
setInterval(function () { 
	if (show === 'game') {
		fpsElement.innerHTML = (f / ((new Date()).getTime() - fpsTime) * 1000).toFixed(0);
		if ((new Date()).getTime() - fpsTime > 5000) resetFPS(); // 5 seconds' average FPS
	}
}, 250);

// Display time, lap time, nr. of laps, speed
setInterval(function () {
	if (show == 'game') {
		var now = (new Date()).getTime();
		timeElement.innerHTML = ((now - time) / 1000).toFixed(2);
		lapTimeElement.innerHTML = ((now - lapTime) / 1000).toFixed(2);
		nrLapsElement.innerHTML = nrLaps;
		speedElement.innerHTML = car.v.toFixed(2);
	}
}, 100);

// Debug
setInterval(function () {
	if (debug) {
		console.log(car.x + ' ' + car.y + ' ' + onTheRoad(car.x, car.y) + ' ' + car.collision());
	}
}, 1000);

frame();