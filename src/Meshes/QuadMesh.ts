import { Mesh, MeshTopology, VertexFormat } from "./Mesh";
import { Scene } from "../Scene";
import { vec3 } from "gl-matrix";

export class QuadMesh extends Mesh {

    constructor(scene: Scene) {
        super(scene);

        const vertexData: Float32Array = new Float32Array([
            //Position        Color       Normal   UV0
            -0.5, +0.5, +0.0, 0, 1, 0, 1, 0, 0, 1, 0, 1,
            -0.5, -0.5, +0.0, 0, 0, 0, 1, 0, 0, 1, 0, 0,
            +0.5, +0.5, +0.0, 1, 1, 0, 1, 0, 0, 1, 1, 1,
            +0.5, -0.5, +0.0, 1, 0, 0, 1, 0, 0, 1, 1, 0
        ]);

        const vertexFormat: VertexFormat = VertexFormat.Position | VertexFormat.Color | VertexFormat.Normal | VertexFormat.UV0;
        this.SetVertexData(vertexFormat, MeshTopology.TriangleStrip, 4, vertexData, false);
        this.SetBounds(vec3.fromValues(-0.5, -0.5, 0.0), vec3.fromValues(0.5, 0.5, 0.0));

        this.isLoaded = true;
    }
}