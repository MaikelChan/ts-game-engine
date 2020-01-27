import { vec3 } from "gl-matrix";

export class Plane {

	private normal: vec3;
	get Normal(): vec3 { return this.normal; }

	private distance: number;
	get Distance(): number { return this.distance; }

	constructor() {
		this.normal = vec3.create();
		this.distance = 0;
	}

	public SetPoints(p1: vec3, p2: vec3, p3: vec3) {
		let v1: vec3 = vec3.create();
		let v2: vec3 = vec3.create();

		vec3.subtract(v1, p2, p1);
		vec3.subtract(v2, p3, p1);

		vec3.cross(this.normal, v1, v2);
		vec3.normalize(this.normal, this.normal);

		this.distance = -vec3.dot(this.normal, p1);
	}

	public DistanceFromPoint(point: vec3): number {
		return vec3.dot(this.normal, point) + this.distance;
	}
}