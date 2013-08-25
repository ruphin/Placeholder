var canvas

var down = [];
var mouse = { position: vec2(0.0, 0.0), delta: vec2(0.0, 0.0), left: false, right: false };

var camera = vec2(0.0, 0.0)

var timer = 0
var build_mode = false
var tower_mode = false
var harvester_mode = false
var money = 0
var total_score = 0

var WORLD_SIZE = 40
var TOWER_COST = 10
var HARVESTER_COST = 20

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

	if(mouse.left && build_mode && ((money >= TOWER_COST && tower_mode) || (money >= HARVESTER_COST && harvester_mode))) {
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
      if(tower_mode) {
			  spawn_tower(world_coords);
        money = money - TOWER_COST;
      } else if(harvester_mode) {
        spawn_harvester(world_coords);
        money = money - HARVESTER_COST;
      }
		}

		mouse.left = false;
	}

	vec2_set(mouse.delta, 0, 0);
}

function set_tower_mode() {
  console.log('tower mode')
  tower_mode = true
  harvester_mode = false
}

function set_harvester_mode() {
  console.log('harvester mode')
  harvester_mode = true
  tower_mode = false
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
		//if(t.target == null || t.target.dead ||
		//   vec2_distance_squared(t.position, t.target.position) > t.range * t.range) {
		    var score = 0.0
		    t.target = undefined

			// Find target
			each_entity('targettable_by_towers', function(e) {
				if(vec2_distance_squared(e.position, t.position) < t.range * t.range) {
					var s = vec2_distance_squared(e.position, t.position)
					if(s > score) {
						score = s
						t.target = e
					}
				}
			});

			/*
			if(targets.length > 0) {
				t.target = random_element(targets)
			} else {
				t.target = undefined
			}
			*/
		//}

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
      if(t.id in indices['enemy']) {
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
			}
		});
	ctx.restore();
}
