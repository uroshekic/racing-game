document.body.style.backgroundColor = '#ccc';
var c = document.getElementById('track');
c.width = 1000;
c.height = 600;
c = c.getContext('2d');

var hidden = false; // true => hidden, false => normal

// Background color
c.fillStyle = '#90EE90';				// Normal
if (hidden) c.fillStyle = '#FFF';		// Hidden
c.fillRect(0, 0, 1000, 600);

// Track color
c.fillStyle = '#FEFEFE'; 				// Normal
if (hidden) c.fillStyle = '#000000'; 	// Hidden

var i = 60,
	j = 60,
	r = 50,
	path = 	[ 
				[ 190, 0 ],
				[ 0, 240 ],
				[ 300, 0 ],
				[ 0, -240 ],
				[ 390, 0 ],
				[ 0, 480 ],
				[ -140, 0 ],
				[ 0, -340 ],
				[ -110, 0 ],
				[ 0, 250 ],
				[ -240, 0 ],
				[ 0, 90 ],
				[ -390, 0 ],
				[ 0, -480 ],
			],
	x, y, b;

// Draw
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

// Start/Finish line
if (!hidden) {
	c.fillStyle = '#000';
	if (r == 45) c.fillRect(895, 424, 2*r, 10);
	if (r == 50) c.fillRect(890, 424, 2*r, 10);
}

document.getElementById('url').href = document.getElementById('track').toDataURL();