import { Mesh, MeshTopology, VertexFormat, VERTEX_POSITION_SIZE, VERTEX_COLOR_SIZE, VERTEX_NORMAL_SIZE, VERTEX_UV_SIZE } from "./Mesh";
import { Scene } from "../Scene";
import { vec3 } from "gl-matrix";

export class SphereMesh extends Mesh {

    private readonly widthSegments: number;
    private readonly heightSegments: number;

    constructor(scene: Scene, widthSegments: number, heightSegments: number) {
        super(scene);

        this.widthSegments = Math.max(3, Math.floor(widthSegments));
        this.heightSegments = Math.max(3, Math.floor(heightSegments));
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

        for (let iy: number = 0; iy <= this.heightSegments; iy++) {
            const v = iy / this.heightSegments;

            let uOffset = 0;

            if ((iy === 0 && thetaStart === 0) || (iy === this.heightSegments && thetaEnd === Math.PI)) {
                uOffset = 0.5 / this.widthSegments;
            }

            for (let ix: number = 0; ix <= this.widthSegments; ix++) {
                if (ix === this.widthSegments && (iy === 0 || iy === this.heightSegments)) continue;

                const u = ix / this.widthSegments;

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

        for (let iy: number = 0; iy < this.heightSegments; iy++) {
            for (let ix: number = 0; ix < this.widthSegments; ix++) {

                if (iy === 0) {
                    indexData[i++] = (iy + 0) * (this.widthSegments) + (ix + 0) + iy;
                    indexData[i++] = (iy + 1) * (this.widthSegments) + (ix + 0) + iy;
                    indexData[i++] = (iy + 1) * (this.widthSegments) + (ix + 1) + iy;
                }
                else if (iy === 1) {
                    indexData[i++] = (iy + 0) * (this.widthSegments) + (ix + 1) + iy - 1;
                    indexData[i++] = (iy + 0) * (this.widthSegments) + (ix + 0) + iy - 1;
                    indexData[i++] = (iy + 1) * (this.widthSegments) + (ix + 0) + iy;

                    indexData[i++] = (iy + 0) * (this.widthSegments) + (ix + 1);
                    indexData[i++] = (iy + 1) * (this.widthSegments) + (ix + 0) + 1;
                    indexData[i++] = (iy + 1) * (this.widthSegments) + (ix + 1) + 1;
                }
                else if (iy > 1 && iy < this.heightSegments - 1) {
                    indexData[i++] = (iy + 0) * (this.widthSegments) + (ix + 1) + iy - 1;
                    indexData[i++] = (iy + 0) * (this.widthSegments) + (ix + 0) + iy - 1;
                    indexData[i++] = (iy + 1) * (this.widthSegments) + (ix + 0) + iy;

                    indexData[i++] = (iy + 0) * (this.widthSegments) + (ix + 1) + iy - 1;
                    indexData[i++] = (iy + 1) * (this.widthSegments) + (ix + 0) + iy;
                    indexData[i++] = (iy + 1) * (this.widthSegments) + (ix + 1) + iy;
                }
                else if (iy === this.heightSegments - 1) {
                    indexData[i++] = (iy + 0) * (this.widthSegments) + (ix + 1) + iy - 1;
                    indexData[i++] = (iy + 0) * (this.widthSegments) + (ix + 0) + iy - 1;
                    indexData[i++] = (iy + 1) * (this.widthSegments) + (ix + 0) + iy;
                }
            }
        }

        const vertexFormat: VertexFormat = VertexFormat.Position | VertexFormat.Color | VertexFormat.Normal | VertexFormat.UV0;
        this.SetVertexData(vertexFormat, MeshTopology.Triangles, vertexCount, vertexData, false);
        this.SetIndexData(indexData);
        this.SetBounds(vec3.fromValues(-0.5, -0.5, -0.5), vec3.fromValues(0.5, 0.5, 0.5)); // { center: vec3.fromValues(0, 0, 0), radius: 0.707107 }

        this.isLoaded = true;
    }
}