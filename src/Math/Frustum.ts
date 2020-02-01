import { Plane } from "./Plane";
import { BoundingBox } from "./BoundingBox";
import { vec3 } from "gl-matrix";

export const enum IntersectionResults { Inside, Outside, Intersect };

export class Frustum {

    private planes: Plane[];
    get Planes(): Plane[] { return this.planes; }

    constructor() {
        this.planes = [new Plane(), new Plane(), new Plane(), new Plane(), new Plane(), new Plane()];
    }

    public CheckBoundsIntersection(bounds: BoundingBox): IntersectionResults {
        let result: IntersectionResults = IntersectionResults.Inside;

        for (let p: number = 0; p < 6; p++) {
            const positive: vec3 = bounds.GetPositiveVertexFromPlane(this.planes[p]);
            const negative: vec3 = bounds.GetNegativeVertexFromPlane(this.planes[p]);

            if (this.planes[p].DistanceFromPoint(positive) < 0) return IntersectionResults.Outside;
            else if (this.planes[p].DistanceFromPoint(negative) < 0) result = IntersectionResults.Intersect;
        }

        return result;
    }
}