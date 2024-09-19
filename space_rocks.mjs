//TODO.CRITICAL: Make functions for ship operations like turning left and right, facing towards something, and applying thrust

import {
	random_int,
	random_float,
	random_vec2,
} from "./modules/math/random.mjs";
import { Vec2 } from "./modules/math/vec.mjs";
import { Rotation } from "./modules/math/rotation.mjs";
import { Line } from "./modules/math/line.mjs";
import { Ray } from "./modules/math/ray.mjs";

let __initialized = false;

/**
 * @type {HTMCanvasElement}
 */
let cnv;
/** @type {number} */
let canvasWidth;
/** @type {number} */
let canvasHeight;
/**
 * @type {CanvasRenderingContext2D}
 */
let ctx;

/**
 * @type {ImageData}
 */
let ctxImageData;

/**
 * @type {HTMLParagraphElement}
 */
let debug;
let debug_info = [];

/**
 * @typedef Rock
 * @property {Vec2} pos position
 * @property {Vec2} vel velocity
 * @property {number} angle look direction
 * @property {number} angle_delta change in angle
 * @property {Vec2} size siiiiiize
 * rendering
 * @property {number} sides number of sides
 * color
 * @property {number} r
 * @property {number} g
 * @property {number} b
 */

/**
 * @typedef Pointer
 * @property {Vec2} pos
 */

/**
 * @type {Rock[]}
 */
let rocks = [];

let ship = {
	pos: new Vec2(0, 0),
	vel: new Vec2(0, 0),
	angle: Math.PI,
	angle_delta: 0.0,
	angle_delta_force: 0.008,
	angle_delta_max: 0.04,
};

/**
 * @type {Pointer}
 */
const pointer = {
	pos: new Vec2(0, 0),
};

const keys = {
	left: false,
	right: false,
	up: false,
	down: false,
};

const toggles = {
	raycast: false,
	ship_axis: false,
	ship_velocity: false,
	screen_help: false,
};

const debug_options = {
	num_rays: 8,
	scaling: window.devicePixelRatio,
};

//debugging line intersection
const lines = {
	a: new Line(
		random_vec2(0, 0, canvasWidth, canvasHeight),
		random_vec2(0, 0, canvasWidth, canvasHeight),
	),
	b: new Line(
		random_vec2(0, 0, canvasWidth, canvasHeight),
		random_vec2(0, 0, canvasWidth, canvasHeight),
	),
};

export async function init() {
	cnv = document.getElementById("canvas");

	// canvasWidth = cnv.width;
	// canvasHeight = cnv.height;

	cnv.addEventListener("resize", handle_canvas_resize);
	cnv.addEventListener("pointermove", handle_pointer_move);

	document.addEventListener("keydown", handle_keydown);
	document.addEventListener("keyup", handle_keyup);
	document.addEventListener("fullscreenchange", handle_fullscreenchange);

	ctx = cnv.getContext("2d", { willReadFrequently: true });
	ctx.imageSmoothingEnabled = false;
	handle_canvas_resize();

	debug = document.getElementById("debug");

	init_rocks();
	init_ship();

	// setInterval(() => {
	// 	lines.a = new Line(
	// 		random_vec2(0, 0, canvasWidth, canvasHeight),
	// 		random_vec2(0, 0, canvasWidth, canvasHeight),
	// 	);
	// 	lines.b = new Line(
	// 		random_vec2(0, 0, canvasWidth, canvasHeight),
	// 		random_vec2(0, 0, canvasWidth, canvasHeight),
	// 	);
	// }, 1000);
}

export async function load() {
	if (__initialized === false) {
		await init();
	}
	console.log(`loading space rocks`);

	requestAnimationFrame(update);
}

function handle_canvas_resize() {
	//#region super resolution
	// const dpr = window.devicePixelRatio * 2;
	// const rect = cnv.getBoundingClientRect();
	//
	// cnv.width = rect.width * dpr;
	// cnv.height = rect.height * dpr;
	// ctx.resetTransform();
	// ctx.scale(dpr, dpr);
	// cnv.style.width = `${rect.width}px`;
	// cnv.style.height = `${rect.height}px`;
	//
	// canvasWidth = cnv.width / dpr;
	// canvasHeight = cnv.height / dpr;
	//#endregion super resolution

	const dpr = debug_options.scaling;
	const rect = cnv.getBoundingClientRect();

	cnv.width = rect.width * dpr;
	cnv.height = rect.height * dpr;
	ctx.resetTransform();
	ctx.scale(dpr, dpr);
	//-2 to remove the border, otherwise the canvas will grow each time this runs
	cnv.style.width = `${rect.width - 2}px`;
	cnv.style.height = `${rect.height - 2}px`;

	canvasWidth = cnv.width / dpr;
	canvasHeight = cnv.height / dpr;
}

/**
 * @param {PointerEvent} event
 */
function handle_pointer_move(event) {
	pointer.pos.set(event.offsetX, event.offsetY);
}

//TODO.MEDIUM: These key handlers should be switches.

/**
 * @param {KeyboardEvent} event
 */
function handle_keydown(event) {
	const key = event.key.toLowerCase();

	switch (key) {
		case "arrowleft":
		case "a":
			keys.left = true;
			break;
		case "arrowright":
		case "d":
			keys.right = true;
			break;
		case "arrowup":
		case "w":
			keys.up = true;
			break;
		case "arrowdown":
		case "s":
			keys.down = true;
			break;
		default:
			break;
	}
}

/**
 * @param {KeyboardEvent} event
 */
function handle_keyup(event) {
	const key = event.key.toLowerCase();

	switch (key) {
		case "arrowleft":
		case "a":
			keys.left = false;
			break;
		case "arrowright":
		case "d":
			keys.right = false;
			break;
		case "arrowup":
		case "w":
			keys.up = false;
			break;
		case "arrowdown":
		case "s":
			keys.down = false;
			break;
		case "f":
			toggle_fullscreen();
			break;
		case "1":
			toggles.ship_axis = !toggles.ship_axis;
			break;
		case "2":
			toggles.ship_velocity = !toggles.ship_velocity;
			break;
		case "3":
			toggles.raycast = !toggles.raycast;
			break;
		case "8":
			debug_options.scaling = Math.max(0.25, debug_options.scaling - 0.25);
			handle_canvas_resize();
			break;
		case "9":
			debug_options.scaling = Math.min(20, debug_options.scaling + 0.25);
			handle_canvas_resize();
			break;
		case "-":
			debug_options.num_rays = Math.max(1, debug_options.num_rays / 2);
			break;
		case "=":
			debug_options.num_rays = Math.min(1024, debug_options.num_rays * 2);
			break;
		case "?":
			toggles.screen_help = true;
			break;
		case "q":
			toggles.screen_help = false;
			break;
		default:
			break;
	}

	requestAnimationFrame(update);
}

/**
 * @param {Event}
 */
function handle_fullscreenchange(event) {
	handle_canvas_resize();
}

function toggle_fullscreen() {
	if (!document.fullscreenElement) {
		cnv.requestFullscreen();
	} else if (document.exitFullscreen) {
		document.exitFullscreen();
	}
}

function update_debug() {
	debug_info.push(`pointer.pos: ${pointer.pos}`);
	debug_info.push(`num_rays: ${debug_options.num_rays}`);
	debug.innerText = debug_info.join(`\n`);
	debug_info = [];
}

function init_ship() {
	ship.pos.set(canvasWidth / 2, canvasHeight / 2);
}

function init_rocks() {
	rocks = [];
	const number_rocks = 10;
	for (let i = 0; i < number_rocks; i++) {
		rocks.push(create_rock());
	}
}

function create_rock() {
	const min_size = 2;
	const max_size = 18;
	const min_speed = 0.1;
	const max_speed = 0.8;
	const min_look_delta = 0.01;
	const max_look_delta = 0.05;
	/** @type {Rock} */
	const rock = {
		pos: random_vec2(0, 0, canvasWidth, canvasHeight),
		vel: random_vec2(-max_speed, max_speed),
		// look: random_vec2(min_speed, max_speed),
		// look_delta: random_vec2(-max_look_delta, max_look_delta),
		angle: random_float(-Math.PI, Math.PI),
		angle_delta: random_float(-Math.PI / 88, Math.PI / 88),
		size: random_vec2(min_size, max_size),
		sides: 5,
		r: 255, //Math.round(Math.random() * 255),
		g: 255, //Math.round(Math.random() * 255),
		b: 255, //Math.round(Math.random() * 255),
	};
	//set sides based on the size of the rock
	const size = rock.size.length() / 4;
	rock.sides = random_int(3 + size, 5 + size);
	return rock;
}

let frame_time = 16;
function update() {
	const start = performance.now();
	const primary = "#eef";
	const secondary = "#aaeeff";
	const accent = "#f0ff31";
	const background = "#222240";
	ctx.fillStyle = background;

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// ctxImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	update_physics();

	check_collisions();

	// render_pixel();

	rock_lines = [
		new Line(new Vec2(0, 0), new Vec2(canvasWidth, 0)), //TL -> TR
		new Line(new Vec2(canvasWidth, 0), new Vec2(canvasWidth, canvasHeight)), //TR -> BR
		new Line(new Vec2(canvasWidth, canvasHeight), new Vec2(0, canvasHeight)), //BR -> BL
		new Line(new Vec2(0, canvasHeight), new Vec2(0, 0)), //BL -> TL
	];
	render_rocks();

	render_ship();

	render_debug();

	const end = performance.now();
	frame_time = end - start;
	debug_info.unshift(`frame_time: ${frame_time.toFixed(2)}ms`);
	debug_info.unshift(`fps: ${(1000 / frame_time).toFixed(2)}`);
	update_debug();
	if (toggles.screen_help) {
		render_screen_help();
	}
	if (frame_time < 16) {
		setTimeout(() => {
			requestAnimationFrame(update);
		}, 16 - frame_time);
	} else {
		requestAnimationFrame(update);
	}
}

function render_screen_help() {
	ctx.save();
	const primary = "#eef";
	const secondary = "#aaeeff";
	const accent = "#f0ff31";
	const background = "#222240";

	ctx.beginPath();
	ctx.globalAlpha = 0.8;
	ctx.fillStyle = background;
	ctx.fillRect(
		canvasWidth * 0.2,
		canvasHeight * 0.2,
		canvasWidth * 0.6,
		canvasHeight * 0.6,
	);
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.globalAlpha = 1.0;
	ctx.strokeStyle = accent;

	ctx.rect(
		canvasWidth * 0.2,
		canvasHeight * 0.2,
		canvasWidth * 0.6,
		canvasHeight * 0.6,
	);
	ctx.closePath();
	ctx.stroke();

	ctx.beginPath();
	ctx.fillStyle = accent;
	ctx.font = "20pt monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("controls", canvasWidth * 0.5, canvasHeight * 0.25);
	ctx.closePath();
	ctx.fill();

	const controls = [
		{
			key: "?",
			description: "show this help screen",
		},
		{
			key: "q",
			description: "close this help screen",
		},
		{
			key: "w | up arrow",
			description: "move ship forward",
		},
		{
			key: "a | left arrow",
			description: "turn ship left",
		},
		{
			key: "d | right arrow",
			description: "turn ship right",
		},
		{
			key: "s | down arrow",
			description: "brake ship",
		},
		{
			key: "1",
			description: "[debug] show ship axis",
		},
		{
			key: "2",
			description: "[debug] show ship velocity",
		},
		{
			key: "3",
			description: "[debug] show raycasting",
		},
		{
			key: "8",
			description: `[debug] decrease scaling (${debug_options.scaling})`,
		},
		{
			key: "9",
			description: `[debug] increase scaling (${debug_options.scaling})`,
		},
		{
			key: "-",
			description: `[debug] decrease number of rays (${debug_options.num_rays})`,
		},
		{
			key: "=",
			description: `[debug] increase number of rays (${debug_options.num_rays})`,
		},
	];

	ctx.beginPath();
	ctx.font = "bold 14pt monospace";
	ctx.textAlign = "right";
	ctx.fillStyle = secondary;
	for (let i = 0; i < controls.length; i++) {
		const control = controls[i];
		ctx.fillText(control.key, canvasWidth * 0.36, canvasHeight * 0.3 + i * 20);
	}
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.font = "14pt monospace";
	ctx.textAlign = "left";
	ctx.fillStyle = primary;
	for (let i = 0; i < controls.length; i++) {
		const control = controls[i];
		ctx.fillText(
			control.description,
			canvasWidth * 0.42,
			canvasHeight * 0.3 + i * 20,
		);
	}
	ctx.closePath();
	ctx.fill();

	ctx.restore();
}

function check_collisions() {
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = "#fa0";
	for (const sline of ship_lines) {
		for (const rline of rock_lines) {
			const point = sline.intersect(rline);
			if (point) {
				ctx.ellipse(point.x, point.y, 14, 14, 0, 0, Math.PI * 2, false);
				//if we hit once we don't need to check anymore
				break;
			}
		}
	}
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

function update_physics() {
	//radians are positive in the counter-clockwise direction
	if (keys.left) {
		ship.angle_delta = Math.min(
			ship.angle_delta_max,
			ship.angle_delta + ship.angle_delta_force, // * frame_time,
		);
	}
	if (keys.right) {
		ship.angle_delta = Math.max(
			-ship.angle_delta_max,
			ship.angle_delta - ship.angle_delta_force, // * frame_time,
		);
	}
	if (keys.up) {
		const fr = new Vec2(Math.sin(ship.angle) * 0.1, Math.cos(ship.angle) * 0.1);
		ship.vel = ship.vel.add(fr); //.mul(new Vec2(frame_time, frame_time)));
	}

	//auto-brake
	if (keys.down) {
		const forward = new Vec2(Math.sin(ship.angle), Math.cos(ship.angle));
		const backward = new Vec2(
			Math.sin(ship.angle) * -1,
			Math.cos(ship.angle) * -1,
		);
		const left = new Vec2(Math.cos(ship.angle), -Math.sin(ship.angle));
		forward.normalize();
		backward.normalize();
		left.normalize();

		const diff = ship.vel.sub(backward);
		diff.normalize();
		const dt = forward.dot(diff);
		const dist_from_aligned = 1 - Math.abs(dt);

		const left_check = left.dot(diff);

		debug_info.push(`diff: ${diff}`);
		debug_info.push(`dt: ${dt.toFixed(4)}`);
		debug_info.push(`dfa: ${dist_from_aligned.toFixed(4)}`);
		debug_info.push(`left_check: ${left_check.toFixed(4)}`);

		if (left_check > 0.1) {
			//turn right
			ship.angle_delta = Math.max(
				-ship.angle_delta_max, // * 0.2,
				// ship.angle_delta - ship.angle_delta_force - dist_from_aligned,
				ship.angle_delta_force * -dist_from_aligned * 16,
			);
		} else {
			//turn left
			ship.angle_delta = Math.min(
				ship.angle_delta_max, // * 0.2,
				// ship.angle_delta + ship.angle_delta_force + dist_from_aligned,
				ship.angle_delta_force * dist_from_aligned * 16,
			);
		}

		//if we're aligned, then apply forward thrust *lightly*
		if (dist_from_aligned < 0.05 && ship.vel.length() > 0.1) {
			ship.vel = ship.vel.add(forward.mul(new Vec2(0.1, 0.1)));
		}
	}

	for (let i = 0; i < rocks.length; i++) {
		const rock = rocks[i];

		rock.pos = rock.pos.add(rock.vel); //.mul(new Vec2(frame_time, frame_time)));

		const length = rock.size.length() * 1.5;
		if (rock.pos.x + length < 0) {
			rock.pos.x = canvasWidth + length;
		} else if (rock.pos.x - length > canvasWidth) {
			rock.pos.x = 0 - length;
		}

		if (rock.pos.y + length < 0) {
			rock.pos.y = canvasHeight + length;
		} else if (rock.pos.y - length > canvasHeight) {
			rock.pos.y = 0 - length;
		}

		rock.angle += rock.angle_delta; // * frame_time;
	}

	ship.pos = ship.pos.add(ship.vel); //.mul(new Vec2(frame_time, frame_time)));
	ship.angle += ship.angle_delta; // * frame_time;

	if (ship.pos.x + 20 < 0) {
		ship.pos.x = canvasWidth + 20;
	} else if (ship.pos.x - 20 > canvasWidth) {
		ship.pos.x = -20;
	}
	if (ship.pos.y + 20 < 0) {
		ship.pos.y = canvasHeight + 20;
	} else if (ship.pos.y - 20 > canvasHeight) {
		ship.pos.y = -20;
	}
}

function render_line_original(start_x, start_y, end_x, end_y) {
	//NOTE: the reason the start and end points are being rounded in several places instead of fixing them once at the start is because I didn't want to lessen the accuracy of calculating `xd`, `xy`, and `resolution`

	const sx = Math.round(start_x);
	const sy = Math.round(start_y);
	const ex = Math.round(end_x);
	const ey = Math.round(end_y);

	// const xd = end_x - start_x;
	// const yd = end_y - start_y;
	// const resolution = Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2));

	const xd = ex - sx;
	const yd = ey - sy;
	const resolution = Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2));

	const points = [{ x: sx, y: sy }];

	let x = sx;
	let y = sy;

	for (let i = 0; i < resolution; i++) {
		x += Math.round(xd / resolution);
		y += Math.round(yd / resolution);
		points.push({ x: x, y: y });
	}
	points.push({ x: ex, y: ey });

	const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	const buf8 = imageData.data; //use imageData directly so we don't overwrite it

	for (let i = 0; i < points.length; i++) {
		const vec2 = points[i];
		if (
			vec2.x < 0 ||
			vec2.y < 0 ||
			vec2.x > canvasWidth ||
			vec2.y > canvasHeight
		) {
			continue;
		}
		buf8[vec2.y * canvasWidth * 4 + vec2.x * 4] = 255; //red
		buf8[vec2.y * canvasWidth * 4 + vec2.x * 4 + 1] = 255; //green
		buf8[vec2.y * canvasWidth * 4 + vec2.x * 4 + 2] = 255; //blue
		buf8[vec2.y * canvasWidth * 4 + vec2.x * 4 + 3] = 255; //alpha

		/*
		 
		0 0 255 170 017 255
			 0   1   2   3
		0 1 255 170 017 255
			 4   5   6   7
		0 2 255 170 017 255
			 8   9   10  11
		0 3 255 170 017 255
			 12  13  14  15
		
		*/
	}

	imageData.data.set(buf8, 0, 0);
	ctx.putImageData(imageData, 0, 0);
}

/**
 * @param {Vec2} start
 * @param {Vec2} end
 */
function render_line_pixel(start, end) {
	//NOTE: Don't round any of the values until right before you render, otherwise you'll get inaccurate, jumpy points. Keep precision as long as possible.

	let delta = end.sub(start);
	const resolution = delta.length();
	delta = delta.div(new Vec2(resolution, resolution));

	const points = [start.clone()];
	let curr = start.clone();
	for (let i = 0; i < resolution; i++) {
		curr = curr.add(delta);
		points.push(curr.clone());
	}
	points.push(end.clone());

	const buf8 = ctxImageData.data; //use imageData directly so we don't overwrite it

	for (let i = 0; i < points.length; i++) {
		const vec2 = { x: Math.round(points[i].x), y: Math.round(points[i].y) };
		if (
			vec2.x < 0 ||
			vec2.y < 0 ||
			vec2.x > canvasWidth ||
			vec2.y > canvasHeight
		) {
			continue;
		}
		buf8[vec2.y * canvasWidth * 4 + vec2.x * 4] = 255; //red
		buf8[vec2.y * canvasWidth * 4 + vec2.x * 4 + 1] = 255; //green
		buf8[vec2.y * canvasWidth * 4 + vec2.x * 4 + 2] = 255; //blue
		buf8[vec2.y * canvasWidth * 4 + vec2.x * 4 + 3] = 255; //alpha

		/*
		 
		0 0 255 170 017 255
			 0   1   2   3
		0 1 255 170 017 255
			 4   5   6   7
		0 2 255 170 017 255
			 8   9   10  11
		0 3 255 170 017 255
			 12  13  14  15
		
		*/
	}

	ctxImageData.data.set(buf8, 0, 0);
	ctx.putImageData(ctxImageData, 0, 0);
}

/**
 * @param {Vec2} start
 * @param {Vec2} end
 */
function render_line(start, end) {
	ctx.beginPath();
	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x, end.y);
	ctx.closePath();
	ctx.stroke();
}

function render_rocks() {
	ctx.save();
	ctx.strokeStyle = "#fff";
	for (let i = 0; i < rocks.length; i++) {
		const rock = rocks[i];

		//center
		const center = rock.pos.center(rock.pos.add(rock.size));

		//TODO: fix angle. using look_delta.length() as a placeholder
		render_circle_segmented(center, rock.size.length(), rock.angle, rock.sides);
	}
	ctx.restore();
}

let ship_lines = [];
function render_ship() {
	ship_lines = [];
	// ctx.ellipse(ship.x, ship.x, 2, 2, ship.angle, 0, 2 * Math.PI, false);
	// ctx.fill();

	const forward = new Vec2(Math.sin(ship.angle), Math.cos(ship.angle));
	const left = new Vec2(Math.cos(ship.angle), -Math.sin(ship.angle));

	//#region ship design
	//#region points
	const point_forward = new Vec2(
		ship.pos.x + forward.x * 8,
		ship.pos.y + forward.y * 8,
	);
	const point_back_left = new Vec2(
		ship.pos.x + forward.x * -4 + left.x * 5,
		ship.pos.y + forward.y * -4 + left.y * 5,
	);
	const point_back_center = new Vec2(
		ship.pos.x + forward.x * -1,
		ship.pos.y + forward.y * -1,
	);
	const point_back_right = new Vec2(
		ship.pos.x + forward.x * -4 + left.x * -5,
		ship.pos.y + forward.y * -4 + left.y * -5,
	);
	//#endregion points

	ctx.save();
	ctx.strokeStyle = "#44FFFF";
	ctx.beginPath();
	ctx.moveTo(point_forward.x, point_forward.y);
	ctx.lineTo(point_back_left.x, point_back_left.y);
	ctx.lineTo(point_back_center.x, point_back_center.y);
	ctx.lineTo(point_back_right.x, point_back_right.y);
	ctx.lineTo(point_forward.x, point_forward.y);
	ctx.closePath();
	ctx.stroke();
	//#endregion ship design
	ship_lines.push(
		new Line(point_forward, point_back_left),
		new Line(point_back_left, point_back_center),
		new Line(point_back_center, point_back_right),
		new Line(point_back_right, point_forward),
	);

	//#region thruster
	if (keys.up) {
		ctx.strokeStyle = "#f80";

		ctx.beginPath();
		ctx.moveTo(ship.pos.x + forward.x * -3, ship.pos.y + forward.y * -3);
		// const start =
		for (let i = -4; i < 4; i++) {
			ctx.lineTo(
				ship.pos.x +
					forward.x * (-8 * (0.9 + Math.sin(Math.random()))) +
					left.x * i,
				ship.pos.y +
					forward.y * (-8 * (0.9 + Math.sin(Math.random()))) +
					left.y * i,
			);
		}
		ctx.closePath();
		ctx.stroke();
	}

	//#endregion thruster
	ctx.restore();

	debug_info.push(`ship.pos: ${ship.pos}`);
	debug_info.push(`ship.vel: ${ship.vel}`);
	debug_info.push(`ship.vel.length(): ${ship.vel.length()}`);
	debug_info.push(`ship.angle: ${ship.angle.toFixed(4)}`);
}

function render_pointer() {
	const look_at = ship.pos.clone();
	look_at.look_at(pointer.pos);

	//radians
	//this `ang` is essentially added to the look vector we calculate above
	const ang = (0 * Math.PI) / 2;
	// https://matthew-brett.github.io/teaching/rotation_2d.html
	const x2 = Math.cos(ang) * look_at.x - Math.sin(ang) * look_at.y;
	const y2 = Math.sin(ang) * look_at.x + Math.cos(ang) * look_at.y;

	ctx.fillStyle = "#4444ff";
	ctx.strokeStyle = "#ffff00";

	// ctx.ellipse(ship.x, ship.x, 2, 2, ship.angle, 0, 2 * Math.PI, false);
	// ctx.fill();

	ctx.beginPath();
	ctx.moveTo(ship.pos.x, ship.pos.y);
	ctx.lineTo(ship.pos.x + x2 * 80, ship.pos.y + y2 * 80);
	ctx.closePath();
	ctx.stroke();
}

function render_ship_axis() {
	const rot = new Rotation(ship.angle);
	const forward = rot.forward();
	const backward = rot.backward();
	const left = rot.left();
	const right = rot.right();

	//forward laser
	ctx.strokeStyle = "#0f0";
	ctx.beginPath();
	ctx.moveTo(ship.pos.x, ship.pos.y);
	ctx.lineTo(ship.pos.x + forward.x * 20, ship.pos.y + forward.y * 20);
	ctx.closePath();
	ctx.stroke();

	//backward laser
	ctx.strokeStyle = "#3aa";
	ctx.beginPath();
	ctx.moveTo(ship.pos.x, ship.pos.y);
	ctx.lineTo(ship.pos.x + backward.x * 20, ship.pos.y + backward.y * 20);
	ctx.closePath();
	ctx.stroke();

	//left laser
	ctx.strokeStyle = "#f00";
	ctx.beginPath();
	ctx.moveTo(ship.pos.x, ship.pos.y);
	ctx.lineTo(ship.pos.x + left.x * 20, ship.pos.y + left.y * 20);
	ctx.closePath();
	ctx.stroke();

	//right laser
	ctx.strokeStyle = "#b0b";
	ctx.beginPath();
	ctx.moveTo(ship.pos.x, ship.pos.y);
	ctx.lineTo(ship.pos.x + right.x * 20, ship.pos.y + right.y * 20);
	ctx.closePath();
	ctx.stroke();
}

function render_ship_velocity() {
	//ship velocity
	ctx.strokeStyle = "#ff0";
	ctx.beginPath();
	ctx.moveTo(ship.pos.x, ship.pos.y);
	ctx.lineTo(ship.pos.x + ship.vel.x * 10, ship.pos.y + ship.vel.y * 10);
	ctx.closePath();
	ctx.stroke();
}

let rock_lines = [];

/**
 * @param {Vec2} center
 * @param {number} radius
 * @param {number} ang
 * @param {number} resolution number of sides that make up the circle
 */
function render_circle_segmented(center, radius, ang, resolution) {
	//resolution is the number of points that make up the circle
	const res = resolution || Math.PI * 2 * radius;
	//spacing is the change in degrees around the circle between each point. e.g. 360 total degrees divided by a resolution of 8 means each point is 45 degrees apart
	const spacing = (Math.PI * 2) / res;

	const points = [];

	for (let i = 0; i < res; i++) {
		const angle = i * spacing + ang;
		const px = center.x + Math.sin(angle) * radius;
		const py = center.y + Math.cos(angle) * radius;
		points.push(new Vec2(px, py));
	}

	let prev = points[0];
	for (let i = 1; i < points.length; i++) {
		const point = points[i];
		// render_line(prev.x, prev.y, point.x, point.y);
		render_line(point, prev);
		rock_lines.push(new Line(point, prev));
		prev = point;
	}
	//connect first point to last point
	render_line(points[0], prev);
	rock_lines.push(new Line(points[0], prev));
}

function render_pixel() {
	const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	const buf = new ArrayBuffer(imageData.data.length);
	const buf8 = new Uint8ClampedArray(buf);
	const data = new Uint32Array(buf);

	for (let i = 0; i < rocks.length; i++) {
		const rock = rocks[i];

		const rx = Math.round(rock.x);
		const ry = Math.round(rock.y);

		const maxX = Math.min(canvasWidth, rx + rock.w);
		const maxY = Math.min(canvasHeight, ry + rock.h);

		for (let ix = rx; ix < maxX; ix++) {
			for (let iy = ry; iy < maxY; iy++) {
				data[iy * canvasWidth + ix] =
					(255 << 24) | //alpha
					(rock.b << 16) | //blue
					(rock.g << 8) | //green
					rock.r;
			}
		}
	}

	imageData.data.set(buf8, 0, 0);
	ctx.putImageData(imageData, 0, 0);
}

function render_canvas_lines() {
	render_line(new Vec2(0, 0), new Vec2(canvasWidth, canvasHeight));
	render_line(new Vec2(0, canvasHeight), new Vec2(canvasWidth, 0));
	render_line(
		new Vec2(canvasWidth / 2, 0),
		new Vec2(canvasWidth / 2, canvasHeight),
	);
	render_line(
		new Vec2(0, canvasHeight / 2),
		new Vec2(canvasWidth, canvasHeight / 2),
	);
}

function render_line_intersect() {
	render_line(lines.a.start, lines.a.end);
	render_line(lines.b.start, lines.b.end);

	const point = lines.a.intersect(lines.b);
	if (point === undefined) return;
	ctx.save();
	ctx.fillStyle = "#ffaaee";
	ctx.ellipse(point.x, point.y, 5, 5, 0, 0, Math.PI * 2, false);
	ctx.fill();
	ctx.restore();
}

function render_ship_rays() {
	ctx.save();
	ctx.fillStyle = "#afa";
	ctx.strokeStyle = "#afa";
	ctx.lineWidth = 0.2;

	const number_rays = debug_options.num_rays;
	const total_rays = Math.PI * 2;
	const ray_step = total_rays / number_rays;

	// const rot = Date.now() * 0.0002;
	const rot = ship.angle;
	for (let i = 0, ii = 0; i < total_rays; i += ray_step, ii += 1) {
		const dir = new Vec2(Math.sin(i + rot), Math.cos(i + rot));
		dir.normalize();
		const ray = new Ray(ship.pos, dir);
		const point = ray.cast(rock_lines);
		if (point) {
			render_line(ship.pos, point);
			ctx.beginPath();
			ctx.ellipse(point.x, point.y, 3, 3, 0, 0, Math.PI * 2, false);
			ctx.closePath();
			ctx.fill();
		}
		// for(const line of rock_lines) {
		// 	const point = ray.c
		// }
	}
	ctx.restore();
}

function render_debug() {
	if (toggles.ship_axis) {
		render_ship_axis();
	}
	if (toggles.ship_velocity) {
		render_ship_velocity();
	}
	if (toggles.raycast) {
		render_ship_rays();
	}
	// render_line_intersect();
	// render_pointer();

	return;
	const center = ship.pos.clone();
	const look_vec = center.clone();
	look_vec.look_vec(ship.look);

	const pointer_look = ship.pos.clone();
	pointer_look.look_at(pointer.pos);

	debug_info.push(
		`ship.look angle pointer_look: ${ship.look.angle_between(pointer_look).toFixed(4)}`,
	);

	// debug_info.push(`pointer perp: ${pointer_look.perp()}`);
	// debug_info.push(`pointer perp: ${pointer_look.perp().length()}`);
	// debug_info.push(`pointer perp: ${Math.cos(pointer_look.perp().length())}`);

	const lnorm = look_vec.clone().normalize();
	const pnorm = pointer_look.clone().normalize();

	debug_info.push(`lnorm dot: ${lnorm.dot(pnorm).toFixed(4)}`);
	debug_info.push(`pnorm dot: ${pnorm.dot(lnorm).toFixed(4)}`);

	debug_info.push(`left_by: ${lnorm.left_by(pnorm).toFixed(4)}`);
	debug_info.push(`right_by: ${lnorm.right_by(pnorm).toFixed(4)}`);

	//radians
	//this `ang` is essentially added to the look vector we calculate above
	const ang = (0 * Math.PI) / 2;
	// https://matthew-brett.github.io/teaching/rotation_2d.html
	const x2 = Math.cos(ang) * look_vec.x - Math.sin(ang) * look_vec.y;
	const y2 = Math.sin(ang) * look_vec.x + Math.cos(ang) * look_vec.y;

	ctx.fillStyle = "#4444ff";
	ctx.strokeStyle = "#ffff00";

	ctx.ellipse(ship.x, ship.x, 2, 2, ship.angle, 0, 2 * Math.PI, false);
	ctx.fill();

	ctx.moveTo(ship.pos.x, ship.pos.y);
	ctx.lineTo(ship.pos.x + x2 * 80, ship.pos.y + y2 * 80);
	ctx.stroke();
}

load();
