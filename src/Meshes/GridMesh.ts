import { Mesh, VERTEX_POSITION_SIZE, VERTEX_COLOR_SIZE, MeshTopology, VertexFormat } from "./Mesh";
import { vec4, vec3 } from "gl-matrix";
import { Scene } from "../Scene";

export class GridMesh extends Mesh {

    private gridSize: number;
    private gridSubdivisions: number;
    private subdivisionsColor: vec4;
    private cellSize: number;

    constructor(scene: Scene, gridSize: number, gridSubdivisions: number, subdivisionsColor: vec4) {
        super(scene);

        this.gridSize = gridSize;
        this.gridSubdivisions = gridSubdivisions;
        this.subdivisionsColor = subdivisionsColor;
        this.cellSize = gridSize / gridSubdivisions;

        const vertexCount: number = 8 * this.gridSubdivisions + 6;
        const vertexData: Float32Array = new Float32Array(vertexCount * (VERTEX_POSITION_SIZE + VERTEX_COLOR_SIZE));

        let v: number = 0;

        for (let s: number = 0; s < this.gridSubdivisions; s++) {
            const distance: number = this.cellSize * (s + 1);

            vertexData[v++] = -distance; vertexData[v++] = 0; vertexData[v++] = -this.gridSize;
            vertexData[v++] = this.subdivisionsColor[0]; vertexData[v++] = this.subdivisionsColor[1]; vertexData[v++] = this.subdivisionsColor[2]; vertexData[v++] = this.subdivisionsColor[3];
            vertexData[v++] = -distance; vertexData[v++] = 0; vertexData[v++] = this.gridSize;
            vertexData[v++] = this.subdivisionsColor[0]; vertexData[v++] = this.subdivisionsColor[1]; vertexData[v++] = this.subdivisionsColor[2]; vertexData[v++] = this.subdivisionsColor[3];

            vertexData[v++] = distance; vertexData[v++] = 0; vertexData[v++] = -this.gridSize;
            vertexData[v++] = this.subdivisionsColor[0]; vertexData[v++] = this.subdivisionsColor[1]; vertexData[v++] = this.subdivisionsColor[2]; vertexData[v++] = this.subdivisionsColor[3];
            vertexData[v++] = distance; vertexData[v++] = 0; vertexData[v++] = this.gridSize;
            vertexData[v++] = this.subdivisionsColor[0]; vertexData[v++] = this.subdivisionsColor[1]; vertexData[v++] = this.subdivisionsColor[2]; vertexData[v++] = this.subdivisionsColor[3];

            vertexData[v++] = -this.gridSize; vertexData[v++] = 0; vertexData[v++] = -distance;
            vertexData[v++] = this.subdivisionsColor[0]; vertexData[v++] = this.subdivisionsColor[1]; vertexData[v++] = this.subdivisionsColor[2]; vertexData[v++] = this.subdivisionsColor[3];
            vertexData[v++] = this.gridSize; vertexData[v++] = 0; vertexData[v++] = -distance;
            vertexData[v++] = this.subdivisionsColor[0]; vertexData[v++] = this.subdivisionsColor[1]; vertexData[v++] = this.subdivisionsColor[2]; vertexData[v++] = this.subdivisionsColor[3];

            vertexData[v++] = -this.gridSize; vertexData[v++] = 0; vertexData[v++] = distance;
            vertexData[v++] = this.subdivisionsColor[0]; vertexData[v++] = this.subdivisionsColor[1]; vertexData[v++] = this.subdivisionsColor[2]; vertexData[v++] = this.subdivisionsColor[3];
            vertexData[v++] = this.gridSize; vertexData[v++] = 0; vertexData[v++] = distance;
            vertexData[v++] = this.subdivisionsColor[0]; vertexData[v++] = this.subdivisionsColor[1]; vertexData[v++] = this.subdivisionsColor[2]; vertexData[v++] = this.subdivisionsColor[3];
        }

        // X
        vertexData[v++] = -this.gridSize; vertexData[v++] = 0; vertexData[v++] = 0;
        vertexData[v++] = 1; vertexData[v++] = 0; vertexData[v++] = 0; vertexData[v++] = 1;
        vertexData[v++] = this.gridSize; vertexData[v++] = 0; vertexData[v++] = 0;
        vertexData[v++] = 1; vertexData[v++] = 0.85; vertexData[v++] = 0; vertexData[v++] = 1;

        // Y
        vertexData[v++] = 0; vertexData[v++] = -this.gridSize; vertexData[v++] = 0;
        vertexData[v++] = 0; vertexData[v++] = 0.75; vertexData[v++] = 0; vertexData[v++] = 1;
        vertexData[v++] = 0; vertexData[v++] = this.gridSize; vertexData[v++] = 0;
        vertexData[v++] = 0.85; vertexData[v++] = 1; vertexData[v++] = 0; vertexData[v++] = 1;

        // Z
        vertexData[v++] = 0; vertexData[v++] = 0; vertexData[v++] = -this.gridSize;
        vertexData[v++] = 0; vertexData[v++] = 0; vertexData[v++] = 1; vertexData[v++] = 1;
        vertexData[v++] = 0; vertexData[v++] = 0; vertexData[v++] = this.gridSize;
        vertexData[v++] = 0; vertexData[v++] = 0.85; vertexData[v++] = 1; vertexData[v++] = 1;

        const vertexFormat: VertexFormat = VertexFormat.Position | VertexFormat.Color;
        this.SetVertexData(vertexFormat, MeshTopology.Lines, vertexCount, vertexData, false);

        let min: vec3 = vec3.fromValues(-this.gridSize, -this.gridSize, -this.gridSize);
        let max: vec3 = vec3.fromValues(this.gridSize, this.gridSize, this.gridSize);
        let radius: number = vec3.len(max);
        this.SetBounds(min, max); // { center: vec3.fromValues(0, 0, 0), radius: radius }

        this.isLoaded = true;
    }
}