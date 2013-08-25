var towerImage = new Image();
towerImage.src = 'graphics/OrangeTower.png';
var harvesterImage = new Image();
harvesterImage.src = 'graphics/BlueTower.png';
var beaconImage = new Image();
beaconImage.src = 'graphics/YellowTower.png';
var creepImage = new Image();
creepImage.src = 'graphics/Creep1.png'
var deadCreepImage = new Image();
deadCreepImage.src = 'graphics/DeadCreep.png'
var portalImage = new Image();
portalImage.src = 'graphics/Portal1.png'

var enemy_proto = {
	'color': '#0000ff',
	'texture': creepImage,
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
	index(e, 'enemy')
	index(e, 'health')
	index(e, 'targettable_by_towers')

	return e
}

var corpse_proto = {
	'color': '#000000',
	'texture': deadCreepImage,
	'size': 1.0,
	'lifetime': 30,
	'initial_lifetime': 30
}

function spawn_corpse(position) {
	var e = create_entity()
	copy(corpse_proto, e)

	e.position = position

	index(e, 'drawable')
	index(e, 'corpse')

	return e
}

var tower_proto = {
	'color': '#ff0000',
	'texture': towerImage,
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
	index(e, 'targettable_by_enemies')
	index(e, 'targettable_by_towers')


	return e
}

var harvester_proto = {
	'color': '#0000aa',
	'texture': harvesterImage,
	'size': 1.0,
	'target': undefined,
	'health': 10,
	'maximum_health': 10,
	'range': 4.5,
	'cost': 20,
	'pull_speed': 1
}

function spawn_harvester(position) {
	var e = create_entity()
	copy(harvester_proto, e)

	e.position = position

	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'harvester')
	index(e, 'health')
	index(e, 'targettable_by_enemies')
	index(e, 'targettable_by_towers')


	return e
}

var beacon_proto = {
	'color': '#ffaa00',
	'texture': beaconImage,
	'size': 1.0,
	'health': 1,
	'maximum_health': 1,
	'range': 9,
	'cost': 20
}

function spawn_beacon(position) {
	var e = create_entity()
	copy(beacon_proto, e)

	e.position = position

	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'beacon')
	index(e, 'health')
	index(e, 'targettable_by_enemies')
	index(e, 'targettable_by_towers')


	return e
}

var portal_proto = {
	'color': '#000000',
	'texture': portalImage,
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
