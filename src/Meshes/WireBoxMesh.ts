import { Mesh, VERTEX_POSITION_SIZE, VERTEX_COLOR_SIZE, VertexFormat, MeshTopology } from "./Mesh";
import { Scene } from "../Scene";
import { vec4 } from "gl-matrix";
import { IBoundingBox } from "../Interfaces";

export class WireBoxMesh extends Mesh {

    constructor(scene: Scene, bounds: IBoundingBox, color: vec4) {
        super(scene);

        const vertexCount: number = 8;
        const vertexData: Float32Array = new Float32Array(vertexCount * (VERTEX_POSITION_SIZE + VERTEX_COLOR_SIZE));

        let v: number = 0;
        vertexData[v++] = bounds.min[0]; vertexData[v++] = bounds.min[1]; vertexData[v++] = bounds.min[2];
        vertexData[v++] = color[0]; vertexData[v++] = color[1]; vertexData[v++] = color[2]; vertexData[v++] = color[3];
        vertexData[v++] = bounds.max[0]; vertexData[v++] = bounds.min[1]; vertexData[v++] = bounds.min[2];
        vertexData[v++] = color[0]; vertexData[v++] = color[1]; vertexData[v++] = color[2]; vertexData[v++] = color[3];
        vertexData[v++] = bounds.min[0]; vertexData[v++] = bounds.min[1]; vertexData[v++] = bounds.max[2];
        vertexData[v++] = color[0]; vertexData[v++] = color[1]; vertexData[v++] = color[2]; vertexData[v++] = color[3];
        vertexData[v++] = bounds.max[0]; vertexData[v++] = bounds.min[1]; vertexData[v++] = bounds.max[2];
        vertexData[v++] = color[0]; vertexData[v++] = color[1]; vertexData[v++] = color[2]; vertexData[v++] = color[3];

        vertexData[v++] = bounds.min[0]; vertexData[v++] = bounds.max[1]; vertexData[v++] = bounds.min[2];
        vertexData[v++] = color[0]; vertexData[v++] = color[1]; vertexData[v++] = color[2]; vertexData[v++] = color[3];
        vertexData[v++] = bounds.max[0]; vertexData[v++] = bounds.max[1]; vertexData[v++] = bounds.min[2];
        vertexData[v++] = color[0]; vertexData[v++] = color[1]; vertexData[v++] = color[2]; vertexData[v++] = color[3];
        vertexData[v++] = bounds.min[0]; vertexData[v++] = bounds.max[1]; vertexData[v++] = bounds.max[2];
        vertexData[v++] = color[0]; vertexData[v++] = color[1]; vertexData[v++] = color[2]; vertexData[v++] = color[3];
        vertexData[v++] = bounds.max[0]; vertexData[v++] = bounds.max[1]; vertexData[v++] = bounds.max[2];
        vertexData[v++] = color[0]; vertexData[v++] = color[1]; vertexData[v++] = color[2]; vertexData[v++] = color[3];

        const indexData: Uint16Array = new Uint16Array([
            0, 1, 1, 3, 3, 2, 2, 0,
            0, 4, 1, 5, 2, 6, 3, 7,
            4, 5, 5, 7, 7, 6, 6, 4
        ]);

        const vertexFormat: VertexFormat = VertexFormat.Position | VertexFormat.Color;
        this.SetVertexData(vertexFormat, MeshTopology.Lines, vertexCount, vertexData);
        this.SetIndexData(indexData);

        this.isLoaded = true;
    }
}