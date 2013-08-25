var enemy_proto = {
	'color': '#0000ff',
	'size': 1.0,
	'target': undefined,
	'movement_speed': 3.0,
	'damage': 1,
	'cooldown': 0,
	'rate': 1,
	'health': 5,
	'maximum_health': 5
}

function spawn_enemy(position) {
	var e = create_entity()
	copy(enemy_proto, e)

	e.position = position

	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'enemy')
	index(e, 'health')
	index(e, 'targettable_by_towers')

	return e
}

var corpse_proto = {
	'color': '#000000',
	'size': 1.0,
	'lifetime': 30,
	'initial_lifetime': 30
}

function spawn_corpse(position) {
	var e = create_entity()
	copy(corpse_proto, e)
	
	e.position = position
	
	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'corpse')
	
	return e
}

var tower_proto = {
	'color': '#00ff00',
	'size': 1.0,
	'target': undefined,
	'health': 10,
	'rate': 1,
	'cooldown': 0,
	'maximum_health': 10,
	'damage': 1,
	'range': 3,
	'cost': 10
}

function spawn_tower(position) {
	var e = create_entity()
	copy(tower_proto, e)

	e.position = position

	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'tower')
	index(e, 'health')

	return e
}

var harvester_proto = {
	'color': '#ffff00',
	'size': 1.0,
	'target': undefined,
	'health': 10,
	'rate': 1,
	'cooldown': 0,
	'maximum_health': 10,
	'range': 4,
	'cost': 20
}

function spawn_harvester(position) {
	var e = create_entity()
	copy(harvester_proto, e)

	e.position = position

	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'harvester')
	index(e, 'health')

	return e
}

var beacon_proto = {
	'color': '#4169e1',
	'size': 1.0,
	'health': 10,
	'maximum_health': 10,
	'range': 7,
	'cost': 10
}

function spawn_beacon(position) {
	var e = create_entity()
	copy(beacon_proto, e)

	e.position = position

	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'beacon')
	index(e, 'health')

	return e
}

var portal_proto = {
	'color': '#000000',
	'size': 1.0,
	'health': 100,
	'rate': 3,
	'cooldown': 0,
	'maximum_health': 100
}

function spawn_portal(position) {
	var e = create_entity()
	copy(portal_proto, e)

	e.position = position

	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'portal')
	index(e, 'health')
	index(e, 'targettable_by_towers')

	return e
}

function copy(a, b) {
	for(var i in a) {
		if (a.hasOwnProperty(i)) {
			b[i] = a[i];
		}
	}
}
