import { Vec2 } from "./vec.mjs";

export class Rotation {
	constructor(radians) {
		this.radians = radians;
	}

	toString() {
		return `Rot(${this.radians})`;
	}

	clone() {
		return new Rotation(this.radians);
	}

	euler() {
		return (this.radians / (Math.PI * 2)) * 360;
	}

	forward() {
		return new Vec2(Math.sin(this.radians), Math.cos(this.radians));
	}

	backward() {
		return new Vec2(Math.sin(this.radians) * -1, Math.cos(this.radians) * -1);
	}

	left() {
		return new Vec2(Math.cos(this.radians), Math.sin(this.radians) * -1);
	}

	right() {
		return new Vec2(Math.cos(this.radians) * -1, Math.sin(this.radians));
	}
}
