import { Vec2 } from "/modules/math/vec.mjs";

export class Ray {
	/**
	 * @param {Vec2} position
	 * @param {Vec2} direction
	 */
	constructor(position, direction) {
		this.position = position;
		this.direction = direction;
	}

	toString() {
		return `Ray(${this.position}, ${this.direction})`;
	}

	/**
	 * @param {Vec2} position
	 * @param {Vec2} direction
	 */
	set(position, direction) {
		this.position = position;
		this.direction = direction;
	}

	clone() {
		return new Ray(this.position, this.direction);
	}

	// length() {
	// 	//untested lol
	// 	return this.end.sub(this.start).length();
	// 	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	// }

	/** Returns the intersection of this Line with the given line
	 * @param {Line} line
	 * @returns {Vec2 | undefined}
	 * @see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
	 */
	intersect(line) {
		//order matters here!
		//target line is x1y1x2y2, then *this* is x3y3x4y4
		const x1 = line.start.x;
		const y1 = line.start.y;
		const x2 = line.end.x;
		const y2 = line.end.y;

		const x3 = this.position.x;
		const y3 = this.position.y;
		const x4 = this.position.x + this.direction.x;
		const y4 = this.position.y + this.direction.y;

		const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (denominator === 0) return undefined;

		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
		const u =
			(-1 * ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3))) / denominator;

		//for a ray, `u` just has to be greater than `0`
		if (t >= 0 && t <= 1 && u >= 0) {
			const x = x1 + t * (x2 - x1);
			const y = y1 + t * (y2 - y1);
			return new Vec2(x, y);
		}
	}

	cast(lines) {
		let closest_point = undefined;
		let shortest_distance = Infinity;
		for (const line of lines) {
			const point = this.intersect(line);
			if (point) {
				const dist = this.position.distance(point);
				if (dist < shortest_distance) {
					closest_point = point;
					shortest_distance = dist;
				}
			}
		}

		return closest_point;
	}
}
