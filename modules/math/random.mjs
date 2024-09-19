import { Vec2 } from "./vec.mjs";

export function random() {
	return Math.random();
}

export function random_int(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

export function random_float(min, max) {
	return Math.random() * (max - min) + min;
}

export function random_vec2(min_x, min_y, max_x, max_y) {
	let ax = min_x;
	let ay = min_y;
	let bx = max_x;
	let by = max_y;

	//no max_x (probably no max_y), so min_x is min for everything and min_y is max for everything
	if (max_x === undefined) {
		ax = min_x;
		ay = min_x;
		bx = min_y;
		by = min_y;
	}

	return new Vec2(random_float(ax, bx), random_float(ay, by));
}
