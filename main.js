var WORLD_SIZE = 40
var ZOOM = 40
var STARTING_MONEY = 80

var canvas

var down = [];
var mouse = { over: false, position: vec2(0.0, 0.0), world: vec2(0.0, 0.0), delta: vec2(0.0, 0.0), left: false, right: false };

var camera = vec2(0.0, 0.0)

var timer = 0
var round = 0

var build_mode = false

var on_mouse_click = undefined
var on_mouse_draw = undefined

var money = STARTING_MONEY
var total_score = 0

var tile = new Image();
tile.src = 'graphics/Tile.png'

var mini_map_mode = false

var undo = []

window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

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
	new_game();
	loop();
}

function new_game() {
	$('#game_over').hide();

	destroy_all_entities();

	mouse = { over: false, position: vec2(0.0, 0.0), world: vec2(0.0, 0.0), delta: vec2(0.0, 0.0), left: false, right: false };

	camera = vec2(0.0, 0.0)

	timer = 0
	round = 0

	build_mode = false

	on_mouse_click = undefined
	on_mouse_draw = undefined

	money = STARTING_MONEY
	total_score = 0

	mini_map_mode = false

	undo = [];
	$('#undo_button').attr('disabled',true);
}

function spawn_random_portal() {
	var position = vec2()
	var max = 10;

	do {
		vec2_set(position,
			Math.random() * (WORLD_SIZE - 10) + 5,
			Math.random() * (WORLD_SIZE - 10) + 5
		)

		max--;
	} while(intersects(portal_proto, position) && max > 0);

	if(max == 0) {
		console.log("Too many iterations");
	}

	var p = spawn_portal(position);
	p.health *= Math.pow(1.02, round)
	p.maximum_health = p.health
}

function undo_build() {
	if(undo.length > 0) {
		var e = undo.pop();

		destroy_entity(e);
		money += e.cost;
	}

	if(undo.length == 0) {
		$('#undo_button').attr('disabled',true);
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

	$(canvas).mouseenter(function(e) {
		mouse.over = true
	});

	$(canvas).mouseleave(function(e) {
		mouse.over = false
	});

	document.addEventListener("mousemove", function(e) {
        vec2_set(mouse.position, e.layerX || e.clientX, e.offsetY || e.layerY)
		vec2_set(mouse.delta,
            e.movementX || e.mozMovementX || e.webkitMovementX || 0,
            e.movementY || e.mozMovementY || e.webkitMovementY || 0
        );
	}, false);
}

function game_over() {
	$('#game_over_score').html(total_score);
	$('#game_over_round').html(round);
	$('#game_over').show();
}

var previous = Date.now()
function loop() {
	// Compute delta
	var now = Date.now();
	var delta = (now - previous) / 1000;
	previous = now;
	if(delta > 0.1) delta = 0.1;

	// Update GUI
	$('#money').html(money)
	$('#round').html(round)
	$('#score').html(total_score);

	if(timer <= 0.0) {
		if(!build_mode) {
			// Start new round
			build_mode = true

			spawn_random_portal()
			round++;

			each_entity('friendly', function(e) {
				e.health = e.maximum_health
			});

			$('#play_button').val('Play');
			$('#play_button').removeAttr('disabled');
		}
	} else {
		build_mode = false
		$('#play_button').val(Math.round(timer));
		$('#play_button').attr('disabled',true);
		$('#undo_button').attr('disabled',true);
	}

	handle_input(delta);

	if(!build_mode && Object.keys(get_entities('friendly')).length == 0) {
		game_over();
	} else {
		if(!build_mode) {
			update(delta);
		}
	}

	render(canvas, camera, delta);
	requestAnimFrame(loop);
}

function play() {
	undo = []
	build_mode = false;
	timer = 10.0;
}

function handle_input(delta) {
	if(down[37] || down[65]) camera.x += delta * 1024;
	if(down[38] || down[87]) camera.y += delta * 1024;
	if(down[39] || down[68]) camera.x -= delta * 1024;
	if(down[40] || down[83]) camera.y -= delta * 1024;
	if(down[80] || down[32]) play();
	if(down[49]) set_tower_mode();
	if(down[50]) set_harvester_mode();
	if(down[51]) set_beacon_mode();
	if(down[52]) set_slower_mode();
	if(down[27]) set_tower_range_mode();

	if(down[85]) {
		undo_build();
		down[85] = false;
	}

	if(down[189]) {
		ZOOM *= 1.01
		camera.x *= 1.01
		camera.y *= 1.01
	}

	if(down[187]) {
		ZOOM *= 0.99
		camera.x *= 0.99
		camera.y *= 0.99
	}

	if(canvas.width > WORLD_SIZE * ZOOM) ZOOM = canvas.width / WORLD_SIZE;
	if(canvas.height > WORLD_SIZE * ZOOM) ZOOM = canvas.height / WORLD_SIZE;

	if(!mouse.left) mini_map_mode = false;

	if(mouse.right) {
		camera.x -= mouse.delta.x;
		camera.y -= mouse.delta.y;
	}

	mouse.world = vec2_clone(mouse.position);
	vec2_sub(mouse.world, camera);
	vec2_mul(mouse.world, 1.0 / ZOOM);

	if(mouse.over && mouse.left) {
		if(mouse.position.x > 10 && mouse.position.x < 10 + WORLD_SIZE * 3
		&& mouse.position.y > 10 && mouse.position.y < 10 + WORLD_SIZE * 3 || mini_map_mode) {
			// Click on mini map
			camera.x = mouse.position.x / 3 * -ZOOM + canvas.width;
			camera.y = mouse.position.y / 3 * -ZOOM + canvas.height;

			mini_map_mode = true
		} else if(!mini_map_mode && build_mode) {
			// Click on map
			if(on_mouse_click) {
				on_mouse_click();
			}
			mouse.left = false;
		}
	}

	if(mouse.over && mouse.right) set_tower_range_mode();

	if(camera.x > 0) camera.x = 0;
	if(camera.y > 0) camera.y = 0;
	if(camera.x < -WORLD_SIZE * ZOOM + canvas.width) camera.x = -WORLD_SIZE * ZOOM + canvas.width;
	if(camera.y < -WORLD_SIZE * ZOOM + canvas.height) camera.y = -WORLD_SIZE * ZOOM + canvas.height;

	vec2_set(mouse.delta, 0, 0);
}

function set_tower_range(e) {
	on_mouse_draw = function(ctx) {
		e.range = Math.max(Math.min(vec2_distance(e.position, mouse.world), e.max_range), 1.0)
		highlight_in_this_range(ctx, 'building', e.position, e.range)
	}

	on_mouse_click = function() {
		set_tower_range_mode()
	}
}

function set_tower_range_mode() {
	on_mouse_draw = function() {}
	on_mouse_click = function() {
		each_entity('tower', function(e) {
			if(vec2_distance(e.position, mouse.world) < e.size * 0.5) {
				set_tower_range(e)
			}
		});
	}
}

function build(spawn_function, proto) {
	if(money >= proto.cost) {
		if(!intersects(proto, mouse.world)) {
			var e = spawn_function(mouse.world);

			undo.push(e);
			$('#undo_button').removeAttr('disabled');
			money -= proto.cost;
		}
	}
}

function intersects(proto, position) {
	var intersection = false;
	each_entity('collidable', function(e) {
		if(vec2_distance(e.position, position) < e.size * 0.5 + proto.size * 0.5) {
			intersection = true;
		}
	});
	return intersection;
}

function draw_cursor(ctx, proto) {
	ctx.save()
	ctx.translate(mouse.world.x, mouse.world.y)

	if(!intersects(proto, mouse.world)) {
		ctx.globalAlpha = 0.5;
		if(proto.texture) {
			ctx.drawImage(proto.texture, -proto.size / 2, -proto.size / 2, proto.size, proto.size);
		} else {
			ctx.beginPath();
				ctx.arc(0, 0, proto.size * 0.5, 0, 2 * Math.PI, false);
				ctx.fillStyle = proto.color;
			ctx.fill();
		}
	} else {
		ctx.beginPath();
			ctx.arc(0, 0, proto.size / 2, 0, 2 * Math.PI, false);
			ctx.fillStyle = '#ff0000';
			ctx.globalAlpha = 0.5;
		ctx.fill();
	}
	if(proto.range) {
		ctx.beginPath();
			ctx.arc(0, 0, proto.range, 0, 2 * Math.PI, false);
			ctx.strokeStyle = proto.color;
			ctx.globalAlpha = 0.5;
		ctx.stroke();
	}

	ctx.restore();
}

function highlight_in_range(ctx, which, position) {
	each_entity(which, function(e) {
		if(vec2_distance(e.position, position) - e.size * 0.5 < e.range) {
			ctx.save();
			ctx.translate(e.position.x, e.position.y);

			ctx.beginPath();
				ctx.arc(0, 0, e.size / 2, 0, 2 * Math.PI, false);
				ctx.fillStyle = '#ff0000';
				ctx.globalAlpha = 0.8;
			ctx.fill();

			ctx.restore();
		}
	});
}

function highlight_in_this_range(ctx, which, position, range) {
	each_entity(which, function(e) {
		if(vec2_distance(e.position, position) - e.size * 0.5 < range) {
			ctx.save();
			ctx.translate(e.position.x, e.position.y);

			ctx.beginPath();
				ctx.arc(0, 0, e.size / 2, 0, 2 * Math.PI, false);
				ctx.fillStyle = '#ff0000';
				ctx.globalAlpha = 0.8;
			ctx.fill();

			ctx.restore();
		}
	});
}

function set_tower_mode() {
	on_mouse_draw = function(ctx) {
		draw_cursor(ctx, tower_proto)
		highlight_in_range(ctx, 'tower', mouse.world)
		highlight_in_this_range(ctx, 'building', mouse.world, tower_proto.range)
	}
	on_mouse_click = function() {
		build(spawn_tower, tower_proto)
		set_tower_range_mode()
	}
}

function set_harvester_mode() {
	on_mouse_draw = function(ctx) {
		draw_cursor(ctx, harvester_proto)
		highlight_in_range(ctx, 'tower', mouse.world)
	}
	on_mouse_click = function() {
		build(spawn_harvester, harvester_proto)
		set_tower_range_mode()
	}
}

function set_beacon_mode() {
	on_mouse_draw = function(ctx) {
		draw_cursor(ctx, beacon_proto)
		highlight_in_range(ctx, 'tower', mouse.world)
	}
	on_mouse_click = function() {
		build(spawn_beacon, beacon_proto)
		set_tower_range_mode()
	}
}

function set_slower_mode() {
	on_mouse_draw = function(ctx) {
		draw_cursor(ctx, slower_proto)
		highlight_in_range(ctx, 'tower', mouse.world)
	}
	on_mouse_click = function() {
		build(spawn_slower, slower_proto)
		set_tower_range_mode()
	}
}

function update(delta) {
	timer -= delta;

	// Update enemies
	each_entity('enemy', function(e) {
		var beacon = undefined
		var min_distance = beacon_proto.range + 1
		each_entity('beacon', function(b) {
			beacon_distance = vec2_distance(e.position, b.position)
			if(beacon_distance < b.range + e.size * 0.5 && beacon_distance < min_distance) {
				beacon = b;
				min_distance = beacon_distance;
			}
		});
		if(beacon) {
			e.target = beacon;
		}

		// Slow
		var slow_factor = 1.0
		each_entity('slower', function(b) {
			if(vec2_distance(e.position, b.position) + e.size / 2 < b.range) {
				slow_factor *= b.slow;
			}
		});

		// Find target
		var score = 999999999;
		if(e.target == null || e.target.dead) {
			each_entity('targettable_by_enemies', function(t) {
				var s = vec2_distance(e.position, t.position) + Math.random() * 5;
				if(s < score) {
					score = s
					e.target = t
				}
			});
		}

		if(e.target != null) {
			// Vector toward target
			var t = vec2_clone(e.target.position);
			vec2_sub(t, e.position);

			if(vec2_length_squared(t) > 1.0) {
				// Move toward target
				vec2_normalize(t)
				vec2_mul(t, delta * e.movement_speed * Math.pow(1.02, Math.abs(round-10) + 1) * slow_factor)

				vec2_add(e.position, t)
			} else {
				// Fire on target
				if(e.cooldown <= 0) {
					e.target.health -= e.damage * Math.pow(1.02, round)
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
			if(e != t) {
				if(vec2_distance(e.position, t.position) - e.size * 0.5 < t.range) {
					var s = 100 / vec2_distance_squared(e.position, t.position)
					if(indexed(e, 'portal')) {
						s += 100
					}
					if(indexed(e, 'enemy')) {
						s += 200
					}
					if(s > score) {
						score = s
						t.target = e
					}
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

	// Update portals
	each_entity('portal', function(e) {
		e.cooldown -= delta;
		if(e.cooldown < 0.0) {
			e.cooldown = e.rate;
			spawn_enemy(vec2_clone(e.position))
		}
	});

	// Update corpses
	each_entity('corpse', function(e) {
		if(!e.targetted) {
			e.lifetime -= delta;
			if(e.lifetime <= 0) {
				index(e, 'destroy')
			}
		}
	});

	// Update harvesters
	each_entity('harvester', function(e) {
		var score = 0.0

		// Find target
		if(!e.target || e.target.dead) {
			each_entity('corpse', function(t) {
				var d = vec2_distance_squared(e.position, t.position)
				if(d < e.range * e.range) {
					var s = 100 / d
					if(s > score) {
						score = s

						if(!t.targetted) {
							e.target = t
						}
					}
				}
			});
		}

		// Pull target
		if(e.target) {
			e.target.targetted = true

			var t = vec2_clone(e.position);
			vec2_sub(t, e.target.position);

			if(vec2_length_squared(t) > 0.1 * 0.1) {
				// Move toward target
				vec2_normalize(t)
				vec2_mul(t, delta * e.pull_speed)

				vec2_add(e.target.position, t)
			} else {
				index(e.target, 'destroy')
				money += 8
				e.target = undefined
			}
		}
	});

	// Destroy dead enemies
	each_entity('health', function(e) {
		if(e.health <= 0) {
			e.dead = true;
			if(indexed(e, 'enemy')) {
				spawn_corpse(e.position) // Note: reuses position instance
				total_score = total_score + 1
				money += 2
			}
			if(indexed(e, 'harvester')) {
				if(e.target) {
					e.target.targetted = false
				}
			}
			index(e, 'destroy')
		}
	});

	each_entity('destroy', function(e) {
		destroy_entity(e);
	});
}

function render(canvas, camera, delta) {
	// Resize canvas
	var context = document.getElementById('context');
	if(canvas.width !=  context.offsetWidth-6 || canvas.height != context.offsetHeight-6) {
		canvas.width = context.offsetWidth-6;
		canvas.height = context.offsetHeight-6;
	}

	// Get context
	var ctx = canvas.getContext('2d');

	// Clear screen
	ctx.fillStyle='#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.save();
		ctx.translate(camera.x, camera.y);
		ctx.scale(ZOOM, ZOOM);

		// Draw world grid
		ctx.drawImage(tile, 0, 0, 24, 14);
		ctx.drawImage(tile, 24, 0, 24, 14);
		ctx.drawImage(tile, 0, 14, 24, 14);
		ctx.drawImage(tile, 24, 14, 24, 14);
		ctx.drawImage(tile, 0, 28, 24, 14);
		ctx.drawImage(tile, 24, 28, 24, 14);

		// Draw drawables
		each_entity('drawable', function(e) {
			ctx.save()
			ctx.translate(e.position.x, e.position.y)

			// Fade with lifetime
			if(e.lifetime) {
				ctx.globalAlpha = e.lifetime / e.initial_lifetime
			}

			// Draw texture / circle
			if(e.texture) {
				if(e.frame != undefined) {
					e.frametime += delta;
					if(e.frametime > e.frametime_max) {
						e.frame++;
						if(e.frame == e.end_frame) {
							e.frame = e.start_frame;
						}
						e.frametime = 0;
					}
					ctx.drawImage(e.texture,
						0, e.frame / e.frames * e.texture.height, e.texture.width, e.texture.height / e.frames,
						-e.size / 2, -e.size / 2, e.size, e.size
					);
				} else {
					ctx.drawImage(e.texture,
						-e.size / 2, -e.size / 2, e.size, e.size
					);
				}
			} else {
				ctx.beginPath();
					ctx.arc(0, 0, e.size * 0.5, 0, 2 * Math.PI, false);
					ctx.fillStyle = e.color;
				ctx.fill();
			}

			// Draw health bar
			ctx.lineWidth = 0.01;
			if(e.health && e.health < e.maximum_health) {
				ctx.beginPath();
				ctx.rect(-e.size / 2, -e.size / 2 - 0.1, e.health / e.maximum_health * e.size, 0.1)
				ctx.fillStyle = '#ff0000';
				ctx.fill();
				ctx.rect(-e.size / 2, -e.size / 2 - 0.1, e.size, 0.1)
				ctx.strokeStyle = '#000000';
				ctx.stroke();
			}

			// Draw range
			ctx.lineWidth = 0.05;
			if(build_mode && e.range) {
				ctx.beginPath();
				ctx.arc(0, 0, e.range, 0, 2 * Math.PI, false);
				ctx.fillStyle = e.color;
				ctx.globalAlpha = 0.05;
				ctx.fill();
				ctx.strokeStyle = e.color;
				ctx.globalAlpha = 0.5;
				ctx.stroke();
			}
			ctx.restore()
		});

		// Draw lasers
		each_entity('tower', function(e) {
			if(e.target) {
				ctx.lineWidth = 0.1;
				ctx.strokeStyle = '#ff0000';
				ctx.beginPath();
				ctx.moveTo(e.position.x, e.position.y);
				ctx.lineTo(e.target.position.x, e.target.position.y);
				ctx.stroke();

				ctx.lineWidth = 0.05;
				ctx.strokeStyle = '#ffdddd';
				ctx.beginPath();
				ctx.moveTo(e.position.x, e.position.y);
				ctx.lineTo(e.target.position.x, e.target.position.y);
				ctx.stroke();
			}
		});

		// Draw pulling beams
		ctx.lineWidth = 0.1;
		each_entity('harvester', function(e) {
			if(e.target) {
				ctx.lineWidth = 0.1;
				ctx.strokeStyle = '#0000ff';
				ctx.beginPath();
				ctx.moveTo(e.position.x, e.position.y);
				ctx.lineTo(e.target.position.x, e.target.position.y);
				ctx.stroke();

				ctx.lineWidth = 0.05;
				ctx.strokeStyle = '#ddddff';
				ctx.beginPath();
				ctx.moveTo(e.position.x, e.position.y);
				ctx.lineTo(e.target.position.x, e.target.position.y);
				ctx.stroke();
			}
		});

		// Draw mouse cursor
		if(mouse.over && build_mode && on_mouse_draw) {
			on_mouse_draw(ctx)
		}
	ctx.restore();

	// Draw mini map
	ctx.save();
		ctx.translate(10, 10)
		ctx.scale(3, 3)

		// Draw background
		ctx.lineWidth = 0.333
		ctx.beginPath();
		ctx.rect(0, 0, WORLD_SIZE, WORLD_SIZE);
		ctx.fillStyle='#ffffff';
		ctx.fill();
		ctx.strokeStyle='#000000';
		ctx.stroke();

		// Draw frame
		ctx.lineWidth = 0.333
		ctx.beginPath();
		ctx.strokeStyle='#aaaaaa';
		ctx.rect(
			-camera.x / ZOOM,
			-camera.y / ZOOM,
			canvas.width / ZOOM,
			canvas.height / ZOOM
		);
		ctx.stroke();

		each_entity('portal', function(e) {
			ctx.beginPath();
				ctx.rect(e.position.x, e.position.y, 1, 1)
				ctx.fillStyle = '#ff0000';
			ctx.fill();
		});

		each_entity('enemy', function(e) {
			ctx.beginPath();
				ctx.rect(e.position.x, e.position.y, 1, 1)
				ctx.fillStyle = '#ffaa00';
			ctx.fill();
		});

		each_entity('friendly', function(e) {
			ctx.beginPath();
				ctx.rect(e.position.x, e.position.y, 1, 1)
				ctx.fillStyle = '#000000';
			ctx.fill();
		});
	ctx.restore();
}
