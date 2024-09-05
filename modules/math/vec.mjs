/*
 |> vec.mjs
 
 # notes
	global directions like global "up" can be found by normalizing the ship's position and multiplying by `up`
	relative directions like "up" from the ship's look direction can be found by normalizing the look direction and multiplying by `up` - that's why if the ship is already looking up and we want the 'up' from that, we get a global down direction
 */

/**
 * Vec2 is a class for 2D Vectors with some vector functions. The name says it all.
 */
export class Vec2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	toString() {
		return `Vec2(${this.x.toFixed(4)}, ${this.y.toFixed(4)})`;
	}

	set(x, y) {
		this.x = x;
		this.y = y;
	}

	clone() {
		return new Vec2(this.x, this.y);
	}

	length() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	/** Returns distance between this Vec2 and the given Vec2
	 * @param {Vec2} vec
	 */
	distance(vec) {
		return Math.sqrt(Math.pow(vec.x - this.x, 2), Math.pow(vec.y - this.y, 2));
	}

	normalize() {
		const l = this.length();
		this.x = this.x / l;
		this.y = this.y / l;
		return this;
	}

	/** Adds the given Vec2 to this Vec2
	 * returns new Vec2
	 * @param {Vec2} vec
	 */
	add(vec) {
		return new Vec2(this.x + vec.x, this.y + vec.y);
	}

	/** Subtracts the given Vec2 from this Vec2
	 * returns new Vec2
	 * @param {Vec2} vec
	 */
	sub(vec) {
		return new Vec2(this.x - vec.x, this.y - vec.y);
	}

	/** Multiplies this Vec2 by the given Vec2
	 * returns new Vec2
	 * @param {Vec2} vec
	 */
	mul(vec) {
		return new Vec2(this.x * vec.x, this.y * vec.y);
	}

	/** Divides this Vec2 by the given Vec2
	 * returns new Vec2
	 * @param {Vec2} vec
	 */
	div(vec) {
		return new Vec2(this.x / vec.x, this.y / vec.y);
	}

	/** Returns the dot product of this Vec2
	 * @param {Vec2} vec
	 */
	dot(vec) {
		return this.x * vec.x + this.y * vec.y;
	}

	cross(vec) {
		return;
	}

	/** Gets a Vec2 perpendicular to this one
	 */
	perp() {
		return new Vec2(-this.y, this.x);
	}

	/** Finds center between this Vec2 and another Vec2
	 * @param {Vec2} vec
	 */
	center(vec) {
		return this.add(vec).div(new Vec2(2, 2));
	}

	/** Rotates this Vec2 by the given radians
	 * @param {number} radians
	 */
	rotate(radians) {
		// https://matthew-brett.github.io/teaching/rotation_2d.html
		this.x = Math.cos(radians) * this.x - Math.sin(radians) * this.y;
		this.y = Math.sin(radians) * this.x + Math.cos(radians) * this.y;
	}

	/** Rotates this Vec2 by the given radians around a given Vec2
	 * @param {Vec2} vec
	 * @param {number} radians
	 */
	rotate_around(vec, radians) {
		// https://danceswithcode.net/engineeringnotes/rotations_in_2d/rotations_in_2d.html
		this.x =
			vec.x +
			Math.cos(radians) * (this.x - vec.x) -
			Math.sin(radians) * (this.y - vec.y);
		this.y =
			vec.y +
			Math.sin(radians) * (this.x - vec.x) +
			Math.cos(radians) * (this.y - vec.y);
	}

	/** Points this Vec2 at the given Vec2
	 * @param {Vec2} vec
	 */
	look_at(vec) {
		//get the difference using the absolute vectors, not normalized vectors. I don't know why
		const diff = new Vec2(vec.x - this.x, vec.y - this.y);

		diff.normalize();
		this.normalize();

		this.x *= diff.x;
		this.y *= diff.y;
	}

	/** Applies a Vec2 to this Vec2
	 * @param {Vec2} vec
	 */
	look_vec(vec) {
		this.x *= vec.x;
		this.y *= vec.y;
	}

	/** Gets the angle between this Vec2 and the given Vec2
	 * @param {Vec2} vec
	 */
	angle_between(vec) {
		return Math.acos(
			(this.x * vec.x + this.y * vec.y) / (this.length() * vec.length()),
		);
	}

	/** Returns how far left the given Vec2 is from this Vec2's axis
	 *
	 * Any value > 0 means the given Vec2 is left of this Vec2
	 */
	left_by(vec) {
		return this.dot(vec.rotCCW90());
	}

	/** Returns how far right the given Vec2 is from this Vec2's axis
	 *
	 * Any value > 0 means the given Vec2 is right of this Vec2
	 */
	right_by(vec) {
		return this.dot(vec.rotCW90());
	}

	/** Rotates this Vec2 90 degrees clockwise
	 */
	rotCW90() {
		return new Vec2(this.y, -this.x);
	}

	/** Rotates this Vec2 90 degrees counter-clockwise
	 */
	rotCCW90() {
		return new Vec2(-this.y, this.x);
	}
}
