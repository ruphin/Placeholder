var canvas

var down = [];
var mouse = { position: vec2(0.0, 0.0), delta: vec2(0.0, 0.0), left: false, right: false };

var camera = vec2(0.0, 0.0)

function init() {
	canvas = $('#canvas')[0];
	
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();
	
	document.oncontextmenu = document.body.oncontextmenu = function() { return false; };
	
	init_eventhandlers();
	
	loop();
}

function init_eventhandlers() {
	$(window).keydown(function(e) {
		console.log(e.which)
		down[e.which] = true
	});

	$(window).keyup(function(e) {
		down[e.which] = false
	});

	$(window).mousedown(function(e) {
		if(e.which == 1) mouse.left = true;
		if(e.which == 3) mouse.right = true;
	});

	$(window).mouseup(function(e) {
		if(e.which == 1) mouse.left = false;
		if(e.which == 3) mouse.right = false;
	});
	
	document.addEventListener("mousemove", function(e) {
        vec2_set(mouse.position, e.offsetX, e.offsetY)
		vec2_set(mouse.delta,
            e.movementX || e.mozMovementX || e.webkitMovementX || 0,
            e.movementY || e.mozMovementY || e.webkitMovementY || 0
        );
	}, false);
}

var previous = Date.now()
function loop() {
	var now = Date.now();
	var delta = (now - previous) / 1000;
	previous = now;

	if(delta > 0.1) delta = 0.1;
	
	update(delta);
	render(canvas, camera);
	
	requestAnimFrame(loop);
}

function update(delta) {
/*
	if(down[37]) {
		camera.x += delta * 1024;
	}
	
	if(down[38]) {
		camera.y += delta * 1024;
	}
	
	if(down[39]) {
		camera.x -= delta * 1024;
	}
	
	if(down[40]) {
		camera.y -= delta * 1024;
	}
*/
	if(mouse.left) {
		vec2_add(camera, mouse.delta)
	}
	
	vec2_set(mouse.delta, 0, 0);
}

function render(canvas, camera) {
	// Resize canvas
	/*
	if(canvas.width != window.innerWidth || canvas.height != window.innerHeight) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	*/

	// Get context
	var ctx = canvas.getContext('2d');

	// Clear screen
	ctx.fillStyle='#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.save();
		ctx.translate(camera.x, camera.y);
		ctx.scale(40, 40);
	
		// Draw world grid
		ctx.lineWidth = 0.05;
		for(i = 0; i < 101; i++) {
			ctx.beginPath();
				ctx.moveTo(0, i);
				ctx.lineTo(100, i);
			ctx.stroke();
			
			ctx.beginPath();
				ctx.moveTo(i, 0);
				ctx.lineTo(i, 100);
			ctx.stroke();
		}
	ctx.restore();
}