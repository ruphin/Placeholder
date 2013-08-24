var canvas

var down = [];
var mouse = { position: vec2(0.0, 0.0), delta: vec2(0.0, 0.0), left: false, right: false };

var camera = vec2(0.0, 0.0)

var timer = 0

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
	
	//document.oncontextmenu = document.body.oncontextmenu = function() { return false; };
	
	init_eventhandlers();
	
	spawn_enemies(100)
	
	loop();
}

function spawn_enemies(count) {
	for(i = 0; i < count; i++) {
		spawn_enemy(vec2(Math.random() * 100, Math.random() * 100))
	}
}

function init_eventhandlers() {
	$(window).keydown(function(e) {
		console.log(e.which)
		down[e.which] = true
	});

	$(window).keyup(function(e) {
		down[e.which] = false
	});

	$(canvas).mousedown(function(e) {
		if(e.which == 1) mouse.left = true;
		if(e.which == 3) mouse.right = true;
	});

	$(canvas).mouseup(function(e) {
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
	
	if(timer <= 0.0) delta = 0.0;
	if(delta > 0.1) delta = 0.1;
	
	if(timer <= 0.0) {
		$('#play_button').text('Play');
		//$('#play_button').removeAttr('disabled');
	} else {
		$('#play_button').text(Math.round(timer));
		//$('#play_button').attr('disabled',true);
	}
	
	handle_input(delta);
	if(timer > 0.0) {
		update(delta);
	}
	render(canvas, camera);
	
	requestAnimFrame(loop);
}

function play() {
	if(timer <= 0.0) {
		timer = 10.0;
	}
}

function handle_input(delta) {
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
	
	if(down[80]) {
		play();
	}
	
	if(mouse.left) {
		var world_coords = vec2_clone(mouse.position);
		
		vec2_sub(world_coords, camera);
		vec2_mul(world_coords, 1.0 / 40);
		
		var intersection = false;
		each_entity('collidable', function(e) {
			if(vec2_distance(e.position, world_coords) < 1.0) {
				intersection = true;
			}
		});
		
		if(!intersection) {
			spawn_tower(world_coords);
		}
	
		mouse.left = false;
	}
	
	vec2_set(mouse.delta, 0, 0);
}

function random_element(array) {
	return array[Math.floor(Math.random()*array.length)];
}

function update(delta) {
	timer -= delta;

	// Make a list of towers
	var towers = [];
	each_entity('tower', function(e) {
		towers.push(e);
	});

	each_entity('enemy', function(e) {
		if(e.target == null || e.target.dead) {
			e.target = random_element(towers);
		}
		
		if(e.target != null) {
			var t = vec2_clone(e.target.position);
			vec2_sub(t, e.position);
			
			if(vec2_length_squared(t) > 1.0) {
				vec2_normalize(t)
				vec2_mul(t, delta * e.movement_speed)
			
				vec2_add(e.position, t)
			} else {
				// TODO: Set distance to exactly 1.0
				
				if(e.cooldown <= 0) {
					e.target.health -= e.damage
					e.cooldown = e.rate
				} else {
					e.cooldown -= delta
				}
			}
		}
	});
	
	each_entity('tower', function(t) {
		if(t.target == null || t.target.dead || 
		   vec2_distance_squared(t.position, t.target.position) > t.range * t.range) {
		    var targets = []
		   
			// Find target
			each_entity('enemy', function(e) {
				if(vec2_distance_squared(e.position, t.position) < t.range * t.range) {
					targets.push(e)
				}
			});
			
			if(targets.length > 0) {
				t.target = random_element(targets)
			} else {
				t.target = undefined
			}
		}
		
		if(t.target) {
			if(t.cooldown <= 0) {
				t.target.health -= t.damage
				t.cooldown = t.rate
			} else {
				t.cooldown -= delta
			}
		}
	});
	
	each_entity('health', function(t) {
		if(t.health <= 0) {
			t.dead = true
			index(t, 'destroy')
		}
	});
	
	each_entity('destroy', function(e) {
		destroy_entity(e);
	});
}

function render(canvas, camera) {
	// Resize canvas
	var context = document.getElementById('context');
	if(canvas.width !=  context.offsetWidth || canvas.height != context.offsetHeight) {
		canvas.width = context.offsetWidth;
		canvas.height = context.offsetHeight;
	}
	

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
		
		// Draw drawables
		each_entity('drawable', function(e) {
			ctx.save()
				ctx.translate(e.position.x, e.position.y)
				ctx.beginPath();
					ctx.arc(0, 0, e.size * 0.5, 0, 2 * Math.PI, false);
					ctx.fillStyle = e.color;
				ctx.fill();
				
				if(e.health) {
					ctx.beginPath();
						ctx.arc(0, 0, e.size * 0.4, 0, 2 * Math.PI * (e.health / e.maximum_health), false);
						ctx.fillStyle = '#ff0000';
					ctx.fill();
				}
			ctx.restore()
		});
		
		each_entity('tower', function(e) {
			if(e.target) {
				ctx.lineWidth = 0.1;
				ctx.strokeStyle = '#ff0000';
				ctx.beginPath();
					ctx.moveTo(e.position.x, e.position.y);
					ctx.lineTo(e.target.position.x, e.target.position.y);
				ctx.stroke();
			}
		});
	ctx.restore();
}