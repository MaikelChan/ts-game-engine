import { Plane } from "./Plane";

export class Frustum {

    private planes: Plane[];
    get Planes(): Plane[] { return this.planes; }

    constructor() {
        this.planes = [new Plane(), new Plane(), new Plane(), new Plane(), new Plane(), new Plane()];
    }

    // public CheckBoundsIntersection(bounds: Bounds): boolean {
    //     for (let p: number = 0; p < 6; p++) {
    //         let distance: number = this.planes[p].DistanceFromPoint(bounds.Center);
    //         if (distance < -bounds.Radius) return true;
    //     }

    //     return false;
    // }
}