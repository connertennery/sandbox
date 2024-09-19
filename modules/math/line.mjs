import { Vec2 } from "./vec.mjs";

export class Line {
	/**
	 * @param {Vec2} start
	 * @param {Vec2} end
	 */
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}

	toString() {
		return `Line(${this.start}, ${this.end})`;
	}

	/**
	 * @param {Vec2} start
	 * @param {Vec2} end
	 */
	set(start, end) {
		this.start = start;
		this.end = end;
	}

	clone() {
		return new Line(this.start, this.end);
	}

	length() {
		//untested lol
		return this.end.sub(this.start).length();
	}

	/** Returns the intersection of this Line with the given line
	 * @param {Line} line
	 * @returns {Vec2 | undefined}
	 * @see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
	 */
	intersect(line) {
		//order matters here! (it may matter less for whole lines, but it definitely matters for rays)
		//target line is x1y1x2y2, then *this* is x3y3x4y4
		const x1 = line.start.x;
		const y1 = line.start.y;
		const x2 = line.end.x;
		const y2 = line.end.y;

		const x3 = this.start.x;
		const y3 = this.start.y;
		const x4 = this.end.x;
		const y4 = this.end.y;

		const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (denominator === 0) return undefined;

		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
		const u =
			(-1 * ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3))) / denominator;

		//for a ray, `u` just has to be greater than `0`
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			const x = x1 + t * (x2 - x1);
			const y = y1 + t * (y2 - y1);
			return new Vec2(x, y);
		}
	}
}
