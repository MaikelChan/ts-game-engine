import { vec3 } from "gl-matrix";

export class BoundingBox {

    public min: vec3;
    public max: vec3;

    constructor() {
        this.min = vec3.create();
        this.max = vec3.create();
    }

    public GetPoints(): vec3[] {
        let p1 = vec3.fromValues(this.min[0], this.min[1], this.min[2]);
        let p2 = vec3.fromValues(this.max[0], this.min[1], this.min[2]);
        let p3 = vec3.fromValues(this.min[0], this.min[1], this.max[2]);
        let p4 = vec3.fromValues(this.max[0], this.min[1], this.max[2]);

        let p5 = vec3.fromValues(this.min[0], this.max[1], this.min[2]);
        let p6 = vec3.fromValues(this.max[0], this.max[1], this.min[2]);
        let p7 = vec3.fromValues(this.min[0], this.max[1], this.max[2]);
        let p8 = vec3.fromValues(this.max[0], this.max[1], this.max[2]);

        return [p1, p2, p3, p4, p5, p6, p7, p8];
    }
}