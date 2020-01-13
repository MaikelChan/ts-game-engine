import { Mesh, MeshTopology, VertexFormat } from "./Mesh";
import { Scene } from "../Scene";

export class TriangleMesh extends Mesh {

    constructor(scene: Scene) {
        super(scene);

        const vertexData: Float32Array = new Float32Array([
            //Position        Color       Normal   UV0
            +0.0, +0.5, +0.0, 1, 0, 0, 1, 0, 0, 1, 0.5, 1.0,
            -0.5, -0.5, +0.0, 0, 1, 0, 1, 0, 0, 1, 0.0, 0.0,
            +0.5, -0.5, +0.0, 0, 0, 1, 1, 0, 0, 1, 1.0, 0.0
        ]);

        const vertexFormat: VertexFormat = VertexFormat.Position | VertexFormat.Color | VertexFormat.Normal | VertexFormat.UV0;
        this.SetVertexData(vertexFormat, MeshTopology.Triangles, 3, vertexData);

        this.isLoaded = true;
    }
}