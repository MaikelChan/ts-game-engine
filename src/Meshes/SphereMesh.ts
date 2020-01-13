import { Mesh, MeshTopology, VertexFormat, VERTEX_POSITION_SIZE, VERTEX_COLOR_SIZE, VERTEX_NORMAL_SIZE, VERTEX_UV_SIZE } from "./Mesh";
import { Scene } from "../Scene";
import { vec3 } from "gl-matrix";

export class SphereMesh extends Mesh {

    private readonly widthSegments: number;
    private readonly heightSegments: number;

    constructor(scene: Scene, widthSegments: number, heightSegments: number) {
        super(scene);

        this.widthSegments = Math.max(3, Math.floor(widthSegments));
        this.heightSegments = Math.max(2, Math.floor(heightSegments));
        const radius: number = 0.5;
        const phiStart: number = 0;
        const phiLength: number = Math.PI * 2;
        const thetaStart: number = 0;
        const thetaLength: number = Math.PI;
        const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

        const tempVec3: vec3 = vec3.create();

        const vertexCount: number = (this.widthSegments + 1) * (this.heightSegments + 1) - 2;
        const vertexData: Float32Array = new Float32Array(vertexCount * (VERTEX_POSITION_SIZE + VERTEX_COLOR_SIZE + VERTEX_NORMAL_SIZE + VERTEX_UV_SIZE));

        let i: number = 0;

        for (let iy: number = 0; iy <= heightSegments; iy++) {
            const v = iy / heightSegments;

            let uOffset = 0;

            if (iy == 0 && thetaStart == 0) {
                uOffset = 0.5 / widthSegments;
            } else if (iy == heightSegments && thetaEnd == Math.PI) {
                uOffset = - 0.5 / widthSegments;
            }

            for (let ix: number = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;

                // Position
                tempVec3[0] = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                tempVec3[1] = radius * Math.cos(thetaStart + v * thetaLength);
                tempVec3[2] = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                vertexData[i++] = tempVec3[0];
                vertexData[i++] = tempVec3[1];
                vertexData[i++] = tempVec3[2];

                // Color
                vertexData[i++] = 1;
                vertexData[i++] = 1;
                vertexData[i++] = 1;
                vertexData[i++] = 1;

                // Normal
                vec3.normalize(tempVec3, tempVec3);
                vertexData[i++] = tempVec3[0];
                vertexData[i++] = tempVec3[1];
                vertexData[i++] = tempVec3[2];

                // UV0
                vertexData[i++] = u + uOffset;
                vertexData[i++] = 1 - v;
            }
        }

        const triangleCount: number = this.widthSegments * (this.heightSegments - 1) * 2;
        const indexCount = triangleCount * 3;
        const indexData: Uint16Array = new Uint16Array(indexCount);

        i = 0;

        for (let iy: number = 0; iy < heightSegments; iy++) {
            for (let ix: number = 0; ix < widthSegments; ix++) {

                const a = (iy + 0) * (widthSegments + 1) + (ix + 1);
                const b = (iy + 0) * (widthSegments + 1) + (ix + 0);
                const c = (iy + 1) * (widthSegments + 1) + (ix + 0);
                const d = (iy + 1) * (widthSegments + 1) + (ix + 1);

                if (iy !== 0 || thetaStart > 0) {
                    indexData[i++] = a;
                    indexData[i++] = b;
                    indexData[i++] = d;
                }

                if (iy !== heightSegments - 1 || thetaEnd < Math.PI) {
                    indexData[i++] = b;
                    indexData[i++] = c;
                    indexData[i++] = d;
                }
            }
        }

        const vertexFormat: VertexFormat = VertexFormat.Position | VertexFormat.Color | VertexFormat.Normal | VertexFormat.UV0;
        this.SetVertexData(vertexFormat, MeshTopology.Triangles, vertexCount, vertexData);
        this.SetIndexData(indexData);

        this.isLoaded = true;
    }
}