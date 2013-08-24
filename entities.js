function spawn_enemy(position) {
	var e = create_entity()
	
	e.position = position
	e.color = '#0000ff'
	e.size = 1.0
	e.target = undefined
	e.movement_speed = 1.0
	e.damage = 1
	e.cooldown = 0
	e.rate = 1
	e.health = 5
	e.maximum_health = 5
	
	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'enemy')
	index(e, 'health')
	index(e, 'targettable_by_towers')
	
	return e
}

function spawn_tower(position) {
	var e = create_entity()
	
	e.position = position
	e.color = '#00ff00'
	e.size = 1.0
	e.target = undefined
	e.health = 10
	e.rate = 1
	e.cooldown = 0
	e.maximum_health = 10
	e.damage = 1
	e.range = 5
	
	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'tower')
	index(e, 'health')
	
	return e
}

function spawn_harvester(position) {
	var e = create_entity()
	
	e.position = position
	e.color = '#ffff00'
	e.size = 1.0
	e.target = undefined
	e.health = 10
	e.rate = 1
	e.cooldown = 0
	e.maximum_health = 10
	e.range = 5
	
	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'harvester')
	index(e, 'health')
	
	return e
}

function spawn_portal(position) {
	var e = create_entity()
	
	e.position = position
	e.color = '#000000'
	e.size = 1.0
	e.health = 100
	e.rate = 3
	e.cooldown = 0
	e.maximum_health = 100
	
	index(e, 'drawable')
	index(e, 'collidable')
	index(e, 'portal')
	index(e, 'health')
	index(e, 'targettable_by_towers')
	
	return e
}
