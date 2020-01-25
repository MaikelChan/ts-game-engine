import { Mesh, MeshTopology, VertexFormat } from "./Mesh";
import { Scene } from "../Scene";
import { vec3 } from "gl-matrix";

export class CubeMesh extends Mesh {

    constructor(scene: Scene) {
        super(scene);

        const vertexData: Float32Array = new Float32Array([
            //Position        Color       Normal      UV0
            -0.5, +0.5, +0.5, 0, 1, 1, 1, +0, +0, +1, 0, 1, // Front face
            +0.5, +0.5, +0.5, 1, 1, 1, 1, +0, +0, +1, 1, 1,
            -0.5, -0.5, +0.5, 0, 0, 1, 1, +0, +0, +1, 0, 0,
            +0.5, -0.5, +0.5, 1, 0, 1, 1, +0, +0, +1, 1, 0,

            +0.5, +0.5, +0.5, 1, 1, 1, 1, +1, +0, +0, 0, 1, // Right face
            +0.5, +0.5, -0.5, 1, 1, 0, 1, +1, +0, +0, 1, 1,
            +0.5, -0.5, +0.5, 1, 0, 1, 1, +1, +0, +0, 0, 0,
            +0.5, -0.5, -0.5, 1, 0, 0, 1, +1, +0, +0, 1, 0,

            +0.5, +0.5, -0.5, 1, 1, 0, 1, +0, +0, -1, 0, 1, // Back face
            -0.5, +0.5, -0.5, 0, 1, 0, 1, +0, +0, -1, 1, 1,
            +0.5, -0.5, -0.5, 1, 0, 0, 1, +0, +0, -1, 0, 0,
            -0.5, -0.5, -0.5, 0, 0, 0, 1, +0, +0, -1, 1, 0,

            -0.5, +0.5, -0.5, 0, 1, 0, 1, -1, +0, +0, 0, 1, // Left face
            -0.5, +0.5, +0.5, 0, 1, 1, 1, -1, +0, +0, 1, 1,
            -0.5, -0.5, -0.5, 0, 0, 0, 1, -1, +0, +0, 0, 0,
            -0.5, -0.5, +0.5, 0, 0, 1, 1, -1, +0, +0, 1, 0,

            -0.5, +0.5, -0.5, 0, 1, 0, 1, +0, +1, +0, 0, 1, // Top face
            +0.5, +0.5, -0.5, 1, 1, 0, 1, +0, +1, +0, 1, 1,
            -0.5, +0.5, +0.5, 0, 1, 1, 1, +0, +1, +0, 0, 0,
            +0.5, +0.5, +0.5, 1, 1, 1, 1, +0, +1, +0, 1, 0,

            -0.5, -0.5, +0.5, 0, 0, 1, 1, +0, -1, +0, 0, 1, // Bottom face
            +0.5, -0.5, +0.5, 1, 0, 1, 1, +0, -1, +0, 1, 1,
            -0.5, -0.5, -0.5, 0, 0, 0, 1, +0, -1, +0, 0, 0,
            +0.5, -0.5, -0.5, 1, 0, 0, 1, +0, -1, +0, 1, 0
        ]);

        const indexData: Uint16Array = new Uint16Array([
            0, 2, 1, 1, 2, 3,        // Front face
            4, 6, 5, 5, 6, 7,        // Right face
            8, 10, 9, 9, 10, 11,     // Back face
            12, 14, 13, 13, 14, 15,  // Left face
            16, 18, 17, 17, 18, 19,  // Top face
            20, 22, 21, 21, 22, 23   // Bottom face
        ]);

        const vertexFormat: VertexFormat = VertexFormat.Position | VertexFormat.Color | VertexFormat.Normal | VertexFormat.UV0;
        this.SetVertexData(vertexFormat, MeshTopology.Triangles, 24, vertexData);
        this.SetIndexData(indexData);
        this.SetBounds({ min: vec3.fromValues(-0.5, -0.5, -0.5), max: vec3.fromValues(0.5, 0.5, 0.5) }, { center: vec3.fromValues(0, 0, 0), radius: 0.707107 });

        this.isLoaded = true;
    }
}