function vec2(x, y) {
    return {
        x: x,
        y: y
    };
}

function vec2_set(v, x, y) {
	v.x = x;
	v.y = y;
}

function vec2_plus(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}

function vec2_add(a, b) {
    a.x += b.x;
    a.y += b.y;
}

function vec2_minus(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y
    }
}

function vec2_sub(a, b) {
    a.x -= b.x;
    a.y -= b.y;
}

function vec2_times(v, scalar) {
    return {
        x: v.x * scalar,
        y: v.y * scalar
    }
}

function vec2_mul(v, scalar) {
    v.x *= scalar;
    v.y *= scalar;
}

function vec2_length_squared(v) {
    return v.x * v.x + v.y * v.y
}

function vec2_length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y)
}

function vec2_normal(v) {
    return vec2_times(v, 1 / vec2_length(v))
}

function vec2_normalize(v) {
    vec2_mul(v, 1 / vec2_length(v))
}

function vec2_distance(a, b) {
    return vec2_length(vec2_minus(a, b))
}

function vec2_distance_squared(a, b) {
    return vec2_length_squared(vec2_minus(a, b))
}

function vec2_from_angle(angle) {
    return {
        x: Math.sin(angle),
        y: Math.cos(angle)
    }
}

function vec2_to_angle(v) {
    return Math.atan2(v.x, v.y)
}

function vec2_angle(a, b) {
    return vec2_to_angle(vec2_minus(a, b))
}