function spawn_enemy(position) {
	var e = create_entity()
	
	create_component(e, 'position', position)
	create_component(e, 'color', '#0000ff')
	create_component(e
	create_component(e, 'is_enemy', true)
	
	return e
}
