var entities = {};
var indices = {};
var next_entity_id = 0;

function create_entity() {
	var id = next_entity_id++;
	
	return entities[id] = {
		id: id
	};
}

function index(entity, name) {
	// Add to index
	if(!(name in indices)) {
		indices[name] = {};
	}
	indices[name][entity.id] = entity;
}

function indexed(entity, name) {
	return name in indices && entity.id in indices[name];
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

function destroy_all_entities() {
	entities = {};
	indices = {};
	next_entity_id = 0;
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
