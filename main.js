var canvas

var down = [];
var mouse = { over: false, position: vec2(0.0, 0.0), world: vec2(0.0, 0.0), delta: vec2(0.0, 0.0), left: false, right: false };

var camera = vec2(0.0, 0.0)

var timer = 0

var build_mode = false

var on_mouse_click = undefined
var on_mouse_draw = undefined

var money = 0
var total_score = 0

var WORLD_SIZE = 40

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

	loop();
}

function spawn_enemies(count) {
	for(i = 0; i < count; i++) {
		spawn_enemy(vec2(Math.random() * WORLD_SIZE, Math.random() * WORLD_SIZE))
	}
}

function spawn_random_portal() {
	spawn_portal(vec2(Math.random() * WORLD_SIZE, Math.random() * WORLD_SIZE))
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

	$(canvas).mouseenter(function(e) {
		mouse.over = true
	});

	$(canvas).mouseleave(function(e) {
		mouse.over = false
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
  $('#money').html(money)
  $('#score').html(total_score)

	if(delta > 0.1) delta = 0.1;

	if(timer <= 0.0) {
		if(!build_mode) {
			spawn_random_portal()

			build_mode = true
			money = money + 40
		}

		$('#play_button').val('Play');
		$('#play_button').removeAttr('disabled');
	} else {
		build_mode = false
		$('#play_button').val(Math.round(timer));
		$('#play_button').attr('disabled',true);
	}

	handle_input(delta);
	if(!build_mode) {
		update(delta);
	}
	render(canvas, camera);

	requestAnimFrame(loop);
}

function play() {
	if(timer <= 0.0) {
		build_mode = false;
		timer = 10.0;
	}
}

function handle_input(delta) {
	if(down[37] || down[65]) {
		camera.x += delta * 1024;
	}

	if(down[38] || down[87]) {
		camera.y += delta * 1024;
	}

	if(down[39] || down[68]) {
		camera.x -= delta * 1024;
	}

	if(down[40] || down[83]) {
		camera.y -= delta * 1024;
	}

	if(down[80]) {
		play();
	}

	mouse.world = vec2_clone(mouse.position);
	vec2_sub(mouse.world, camera);
	vec2_mul(mouse.world, 1.0 / 40);

	if(mouse.over && mouse.left && build_mode) {
		if(on_mouse_click) {
			on_mouse_click();
		}
		mouse.left = false;
	}

	vec2_set(mouse.delta, 0, 0);
}

function build(spawn_function, cost) {
	if(money >= cost) {
		var intersection = false;
		each_entity('collidable', function(e) {
			if(vec2_distance(e.position, mouse.world) < 1.0) {
				intersection = true;
			}
		});

		if(!intersection) {
			spawn_function(mouse.world);
			money -= cost;
		}
	}
}

function draw_cursor(ctx, proto) {
	var intersection = false;
	each_entity('collidable', function(e) {
		if(vec2_distance(e.position, mouse.world) < proto.size * proto.size) {
			intersection = true;
		}
	});

	if(!intersection) {
		ctx.beginPath();
			ctx.arc(0, 0, proto.size / 2, 0, 2 * Math.PI, false);
			ctx.fillStyle = proto.color;
			ctx.globalAlpha = 0.5;
		ctx.fill();
	} else {
		ctx.beginPath();
			ctx.arc(0, 0, proto.size / 2, 0, 2 * Math.PI, false);
			ctx.fillStyle = '#ff0000';
			ctx.globalAlpha = 0.5;
		ctx.fill();
	}
	console.log(proto.range)
	if(proto.range) {
		ctx.beginPath();
			ctx.arc(0, 0, proto.range, 0, 2 * Math.PI, false);
			ctx.strokeStyle = '#ff0000';
			ctx.globalAlpha = 0.5;
		ctx.stroke();
	}
}

function set_tower_mode() {
	on_mouse_draw = function(ctx) {
		draw_cursor(ctx, tower_proto)
	}
	on_mouse_click = function() {
		build(spawn_tower, tower_proto.cost)
	}
}

function set_harvester_mode() {
	on_mouse_draw = function(ctx) {
		draw_cursor(ctx, harvester_proto)
	}
	on_mouse_click = function() {
		build(spawn_harvester, harvester_proto.cost)
	}
}

function set_beacon_mode() {
	on_mouse_draw = function(ctx) {
		draw_cursor(ctx, beacon_proto)
	}
	on_mouse_click = function() {
		build(spawn_beacon, beacon_proto.cost)
	}
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

	// Update enemies
	each_entity('enemy', function(e) {
		// Find target
		if(e.target == null || e.target.dead) {
			e.target = random_element(towers);
		}

		if(e.target != null) {
			// Vector toward target
			var t = vec2_clone(e.target.position);
			vec2_sub(t, e.position);

			if(vec2_length_squared(t) > 1.0) {
				// Move toward target
				vec2_normalize(t)
				vec2_mul(t, delta * e.movement_speed)

				vec2_add(e.position, t)
			} else {
				// Fire on target
				if(e.cooldown <= 0) {
					e.target.health -= e.damage
					e.cooldown = e.rate
				} else {
					e.cooldown -= delta
				}
			}
		}
	});

	// Update towers
	each_entity('tower', function(t) {
	    var score = 0.0
	    t.target = undefined

		// Find target
		each_entity('targettable_by_towers', function(e) {
			if(vec2_distance_squared(e.position, t.position) < t.range * t.range) {
				var s = 100 / vec2_distance_squared(e.position, t.position)
				if(s > score) {
					score = s
					t.target = e
				}
			}
		});

		// Fire on target
		if(t.target) {
			if(t.cooldown <= 0) {
				t.target.health -= t.damage
				t.cooldown = t.rate
			} else {
				t.cooldown -= delta
			}
		}
	});

	each_entity('portal', function(e) {
		e.cooldown -= delta;
		if(e.cooldown < 0.0) {
			e.cooldown = e.rate;
			spawn_enemy(vec2_clone(e.position))
		}
	});

	each_entity('health', function(t) {
		if(t.health <= 0) {
			t.dead = true;
			if(indexed(t, 'enemy')) {
				total_score = total_score + 1
			}
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
		for(i = 0; i <= WORLD_SIZE; i++) {
			ctx.beginPath();
				ctx.moveTo(0, i);
				ctx.lineTo(WORLD_SIZE, i);
			ctx.stroke();

			ctx.beginPath();
				ctx.moveTo(i, 0);
				ctx.lineTo(i, WORLD_SIZE);
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

				if(build_mode && e.range) {
					ctx.beginPath();
						ctx.arc(0, 0, e.range, 0, 2 * Math.PI, false);
						ctx.strokeStyle = '#ff0000';
						ctx.globalAlpha = 0.5;
					ctx.stroke();
				}
			ctx.restore()
		});

		// Draw lasers
		ctx.lineWidth = 0.1;
		each_entity('tower', function(e) {
			if(e.target) {
				ctx.strokeStyle = '#ff0000';
				ctx.beginPath();
					ctx.moveTo(e.position.x, e.position.y);
					ctx.lineTo(e.target.position.x, e.target.position.y);
				ctx.stroke();
			}
		});

		if(mouse.over && build_mode && on_mouse_draw) {
			ctx.save()
				ctx.translate(mouse.world.x, mouse.world.y)
				on_mouse_draw(ctx)
			ctx.restore()
		}
	ctx.restore();
}
