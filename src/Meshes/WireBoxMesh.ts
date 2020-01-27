import { Mesh, VERTEX_POSITION_SIZE, VERTEX_COLOR_SIZE, VertexFormat, MeshTopology } from "./Mesh";
import { Scene } from "../Scene";
import { vec4 } from "gl-matrix";
import { BoundingBox } from "../Math/BoundingBox";

export class WireBoxMesh extends Mesh {

    private vertexData: Float32Array;

    constructor(scene: Scene, bounds: BoundingBox, color: vec4) {
        super(scene);

        const vertexCount: number = 8;
        this.vertexData = new Float32Array(vertexCount * (VERTEX_POSITION_SIZE + VERTEX_COLOR_SIZE));

        this.GenerateVertexData(bounds, color);

        const indexData: Uint16Array = new Uint16Array([
            0, 1, 1, 3, 3, 2, 2, 0,
            0, 4, 1, 5, 2, 6, 3, 7,
            4, 5, 5, 7, 7, 6, 6, 4
        ]);

        const vertexFormat: VertexFormat = VertexFormat.Position | VertexFormat.Color;
        this.SetVertexData(vertexFormat, MeshTopology.Lines, vertexCount, this.vertexData, true);
        this.SetIndexData(indexData);

        this.isLoaded = true;
    }

    public UpdateBounds(bounds: BoundingBox, color: vec4): void {
        this.GenerateVertexData(bounds, color);
        this.UpdateVertexData(this.vertexData);
    }

    private GenerateVertexData(bounds: BoundingBox, color: vec4): void {
        let v: number = 0;

        this.vertexData[v++] = bounds.min[0]; this.vertexData[v++] = bounds.min[1]; this.vertexData[v++] = bounds.min[2];
        this.vertexData[v++] = color[0]; this.vertexData[v++] = color[1]; this.vertexData[v++] = color[2]; this.vertexData[v++] = color[3];
        this.vertexData[v++] = bounds.max[0]; this.vertexData[v++] = bounds.min[1]; this.vertexData[v++] = bounds.min[2];
        this.vertexData[v++] = color[0]; this.vertexData[v++] = color[1]; this.vertexData[v++] = color[2]; this.vertexData[v++] = color[3];
        this.vertexData[v++] = bounds.min[0]; this.vertexData[v++] = bounds.min[1]; this.vertexData[v++] = bounds.max[2];
        this.vertexData[v++] = color[0]; this.vertexData[v++] = color[1]; this.vertexData[v++] = color[2]; this.vertexData[v++] = color[3];
        this.vertexData[v++] = bounds.max[0]; this.vertexData[v++] = bounds.min[1]; this.vertexData[v++] = bounds.max[2];
        this.vertexData[v++] = color[0]; this.vertexData[v++] = color[1]; this.vertexData[v++] = color[2]; this.vertexData[v++] = color[3];

        this.vertexData[v++] = bounds.min[0]; this.vertexData[v++] = bounds.max[1]; this.vertexData[v++] = bounds.min[2];
        this.vertexData[v++] = color[0]; this.vertexData[v++] = color[1]; this.vertexData[v++] = color[2]; this.vertexData[v++] = color[3];
        this.vertexData[v++] = bounds.max[0]; this.vertexData[v++] = bounds.max[1]; this.vertexData[v++] = bounds.min[2];
        this.vertexData[v++] = color[0]; this.vertexData[v++] = color[1]; this.vertexData[v++] = color[2]; this.vertexData[v++] = color[3];
        this.vertexData[v++] = bounds.min[0]; this.vertexData[v++] = bounds.max[1]; this.vertexData[v++] = bounds.max[2];
        this.vertexData[v++] = color[0]; this.vertexData[v++] = color[1]; this.vertexData[v++] = color[2]; this.vertexData[v++] = color[3];
        this.vertexData[v++] = bounds.max[0]; this.vertexData[v++] = bounds.max[1]; this.vertexData[v++] = bounds.max[2];
        this.vertexData[v++] = color[0]; this.vertexData[v++] = color[1]; this.vertexData[v++] = color[2]; this.vertexData[v++] = color[3];
    }
}