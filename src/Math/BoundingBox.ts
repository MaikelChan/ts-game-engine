import { vec3 } from "gl-matrix";
import { Plane } from "./Plane";

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

    public GetPositiveVertexFromPlane(plane: Plane): vec3 {
        let p: vec3 = vec3.clone(this.min);

        if (plane.Normal[0] >= 0) p[0] = this.max[0];
        if (plane.Normal[1] >= 0) p[1] = this.max[1];
        if (plane.Normal[2] >= 0) p[2] = this.max[2];

        return p;
    }

    public GetNegativeVertexFromPlane(plane: Plane): vec3 {
        let n: vec3 = vec3.clone(this.max);

        if (plane.Normal[0] >= 0) n[0] = this.min[0];
        if (plane.Normal[1] >= 0) n[1] = this.min[1];
        if (plane.Normal[2] >= 0) n[2] = this.min[2];

        return n;
    }
}