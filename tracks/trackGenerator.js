var hidden = !true; // true => hidden, false => normal

/* CONFIG */
///* Track 1
function initTrack() {
	// Background color
	c.fillStyle = '#90EE90';				// Normal
	if (hidden) c.fillStyle = '#FFF';		// Hidden
	c.fillRect(0, 0, node.width, node.height);

	// Track color
	c.fillStyle = '#FEFEFE'; 				// Normal
	if (hidden) c.fillStyle = '#000000'; 	// Hidden
}
var width = 1500,
	height = 800,
	r = 70,
	i = r + 10,
	j = r + 10,
	path = 	[ 
				[ 300, 0 ],
				[ 0, 280 ],
				[ 300, 0 ],
				[ 0, -280 ],
				[ 700, 0 ],
				[ 0, 580 ],
				[ -160, 0 ],
				[ 0, -300 ],
				[ -180, 0 ],
				[ 0, 250 ],
				[ -240, 0 ],
				[ 0, 110 ],
				[ -600, 0 ],
				[ 0, -300 ],
				[ -120, 0 ],
				[ 0, -330 ]
			],
	x, y, b;
function finishTrack() {
	if (!hidden) {
		c.fillStyle = '#000';
		c.fillRect(790, 10, 10, 2*r); // Start/Finish line
	}
}
// */
/* /CONFIG */

document.body.style.backgroundColor = '#ccc';
var node = document.getElementById('track');
node.width = width;
node.height = height;
c = node.getContext('2d');

initTrack();

/* DRAWING */
for (var a = 0; a < path.length; a++) {
	b = path[a];
	x = i;
	y = j;
	i += b[0];
	j += b[1];

	c.beginPath();

	if (b[0] > 0) {
		for (; x < i; x++) {
			c.arc(x, j, r, 0, 2 * Math.PI);
		}	
	} else if (b[0] < 0) {
		for (; x > i; x--) {
			c.arc(x, j, r, 0, 2 * Math.PI);
		}
	}

	if (b[1] > 0) {
		for (; y < j; y++) {
			c.arc(i, y, r, 0, 2 * Math.PI);
		}
	} else if (b[1] < 0) {
		for (; y > j; y--) {
			c.arc(i, y, r, 0, 2 * Math.PI);
		}
	}
	
	c.fill();
}
/* /DRAWING */

finishTrack();

// GENERATE URL
document.getElementById('url').href = document.getElementById('track').toDataURL();