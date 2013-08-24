var entities = {};
var indices = {};
var next_entity_id = 0;

function create_entity() {
	var id = next_entity_id++;
	
	return entities[id] = {
		id: id,
		scratch: {}
	};
}

function create_component(entity, name, value) {
	entity[name] = value;
	
	// Add to index
	if(!(name in indices)) {
		indices[name] = {};
	}
	indices[name][entity.id] = entity;
}

function destroy_entity(entity) {
	// Remove from index
	for(var i in indices) {
        if(indices.hasOwnProperty(i)) {
		    delete indices[i][entity.id];
        }
	}

	delete entities[entity.id];
}

function each_entity(component_name, f) {
	var entities = get_entities(component_name);
	for(var key in entities) {
        if(entities.hasOwnProperty(key)) {
		    f(entities[key]);
        }
	}
}

function get_entities(component_name) {
	if(!(component_name in indices)) {
		return {};
	}

	return indices[component_name];
}
