import { IDisposable, IVertexData, IAttributeTypeInfo } from "../Interfaces";
import { POSITION_ATTRIBUTE, COLOR_ATTRIBUTE, NORMAL_ATTRIBUTE, UV0_ATTRIBUTE, UV1_ATTRIBUTE } from "../Materials/Shader";
import { PipelineState } from "../Systems/Graphics/PipelineState";
import { Scene } from "../Scene";
import { Utils } from "../Utils";

export const enum VertexFormat { Position = 1, Color = 2, Normal = 4, UV0 = 8, UV1 = 16 }
export const enum IndexFormat { UInt16, UInt32 }
export const enum MeshTopology { Points = 0x0000, Lines = 0x0001, LineLoop = 0x0002, LineStrip = 0x0003, Triangles = 0x0004, TriangleStrip = 0x0005, TriangleFan = 0x0006 }

export const VERTEX_POSITION_SIZE: number = 3; // X, Y, Z
export const VERTEX_COLOR_SIZE: number = 4; // R, G, B, A
export const VERTEX_NORMAL_SIZE: number = 3; // X, Y, Z
export const VERTEX_UV_SIZE: number = 2; // X, Y

export const ATTRIBUTE_INFO: IAttributeTypeInfo[] = [
    { vertexFormat: VertexFormat.Position, name: POSITION_ATTRIBUTE, size: VERTEX_POSITION_SIZE },
    { vertexFormat: VertexFormat.Color, name: COLOR_ATTRIBUTE, size: VERTEX_COLOR_SIZE },
    { vertexFormat: VertexFormat.Normal, name: NORMAL_ATTRIBUTE, size: VERTEX_NORMAL_SIZE },
    { vertexFormat: VertexFormat.UV0, name: UV0_ATTRIBUTE, size: VERTEX_UV_SIZE },
    { vertexFormat: VertexFormat.UV1, name: UV1_ATTRIBUTE, size: VERTEX_UV_SIZE }
]

export class Mesh implements IDisposable {

    private context: WebGLRenderingContext;
    private pipelineState: PipelineState;

    protected isLoaded: boolean;
    get IsLoaded(): boolean { return this.isLoaded; }

    private vertexBuffer: WebGLBuffer;
    get VertexBuffer(): WebGLBuffer { return this.vertexBuffer; }

    private indexBuffer: WebGLBuffer | undefined;
    get IndexBuffer(): WebGLBuffer | undefined { return this.indexBuffer; }

    private vertexFormat: VertexFormat;
    get VertexFormat(): VertexFormat { return this.vertexFormat; }

    private indexFormat: IndexFormat;
    get IndexFormat(): IndexFormat { return this.indexFormat; }

    private meshTopology: MeshTopology;
    get MeshTopology(): MeshTopology { return this.meshTopology; }

    private vertexCount: number;
    get VertexCount(): number { return this.vertexCount; }

    private indexCount: number;
    get IndexCount(): number { return this.indexCount; }

    constructor(scene: Scene) {
        this.context = scene.Game.GraphicsSystem.Context;
        this.pipelineState = scene.Game.GraphicsSystem.PipelineState;
        this.isLoaded = false;

        const vertexBuffer = this.context.createBuffer();
        if (vertexBuffer === null) throw new Error("Unable to create position buffer");
        this.vertexBuffer = vertexBuffer;
        Utils.DebugName(this.vertexBuffer, `${this.constructor.name} vertex buffer`);

        this.vertexFormat = VertexFormat.Position;
        this.indexFormat = IndexFormat.UInt16;
        this.meshTopology = MeshTopology.Triangles;
        this.vertexCount = 0;
        this.indexCount = 0;
    }

    Dispose(): void {
        this.isLoaded = false;

        if (this.vertexBuffer) this.context.deleteBuffer(this.vertexBuffer);
        if (this.indexBuffer) this.context.deleteBuffer(this.indexBuffer);
    }

    // protected SetVertexData(vertexData: IVertexData, meshTopology: MeshTopology): void {

    //     this.meshTopology = meshTopology;

    //     this.vertexCount = vertexData.position.length / VERTEX_POSITION_SIZE;
    //     let bufferSize: number = VERTEX_POSITION_SIZE;
    //     this.vertexFormat = VertexFormat.Position;

    //     if (vertexData.color) {
    //         if (vertexData.color.length / VERTEX_COLOR_SIZE != this.vertexCount) throw new Error("Vertex color array has a different number of elements than the vertex count.");
    //         bufferSize += VERTEX_COLOR_SIZE;
    //         this.vertexFormat |= VertexFormat.Color;
    //     }

    //     if (vertexData.normal) {
    //         if (vertexData.normal.length / VERTEX_NORMAL_SIZE != this.vertexCount) throw new Error("Vertex normal array has a different number of elements than the vertex count.");
    //         bufferSize += VERTEX_NORMAL_SIZE;
    //         this.vertexFormat |= VertexFormat.Normal;
    //     }

    //     if (vertexData.uv0) {
    //         if (vertexData.uv0.length / VERTEX_UV_SIZE != this.vertexCount) throw new Error("Vertex UV0 array has a different number of elements than the vertex count.");
    //         bufferSize += VERTEX_UV_SIZE;
    //         this.vertexFormat |= VertexFormat.UV0;
    //     }

    //     if (vertexData.uv1) {
    //         if (vertexData.uv1.length / VERTEX_UV_SIZE != this.vertexCount) throw new Error("Vertex UV1 array has a different number of elements than the vertex count.");
    //         bufferSize += VERTEX_UV_SIZE;
    //         this.vertexFormat |= VertexFormat.UV1;
    //     }

    //     bufferSize *= this.vertexCount;

    //     let bufferData: Float32Array = new Float32Array(bufferSize);
    //     let b: number = 0;

    //     for (let i: number = 0; i < this.vertexCount; i++) {
    //         bufferData[b++] = vertexData.position[i * VERTEX_POSITION_SIZE + 0];
    //         bufferData[b++] = vertexData.position[i * VERTEX_POSITION_SIZE + 1];
    //         bufferData[b++] = vertexData.position[i * VERTEX_POSITION_SIZE + 2];

    //         if (vertexData.color) {
    //             bufferData[b++] = vertexData.color[i * VERTEX_COLOR_SIZE + 0];
    //             bufferData[b++] = vertexData.color[i * VERTEX_COLOR_SIZE + 1];
    //             bufferData[b++] = vertexData.color[i * VERTEX_COLOR_SIZE + 2];
    //             bufferData[b++] = vertexData.color[i * VERTEX_COLOR_SIZE + 3];
    //         }

    //         if (vertexData.normal) {
    //             bufferData[b++] = vertexData.normal[i * VERTEX_NORMAL_SIZE + 0];
    //             bufferData[b++] = vertexData.normal[i * VERTEX_NORMAL_SIZE + 1];
    //             bufferData[b++] = vertexData.normal[i * VERTEX_NORMAL_SIZE + 2];
    //         }

    //         if (vertexData.uv0) {
    //             bufferData[b++] = vertexData.uv0[i * VERTEX_UV_SIZE + 0];
    //             bufferData[b++] = vertexData.uv0[i * VERTEX_UV_SIZE + 1];
    //         }

    //         if (vertexData.uv1) {
    //             bufferData[b++] = vertexData.uv1[i * VERTEX_UV_SIZE + 0];
    //             bufferData[b++] = vertexData.uv1[i * VERTEX_UV_SIZE + 1];
    //         }
    //     }

    //     // Make sure current VAO is null so we don't modify other VAO when binding buffers
    //     this.pipelineState.CurrentVAO = undefined;

    //     this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vertexBuffer);
    //     this.context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, bufferData, WebGLRenderingContext.STATIC_DRAW);
    // }

    protected SetVertexData(vertexFormat: VertexFormat, meshTopology: MeshTopology, vertexCount: number, vertexData: Float32Array): void {
        let stride: number = 0;
        if ((vertexFormat & VertexFormat.Position) !== 0) stride += VERTEX_POSITION_SIZE;
        if ((vertexFormat & VertexFormat.Color) !== 0) stride += VERTEX_COLOR_SIZE;
        if ((vertexFormat & VertexFormat.Normal) !== 0) stride += VERTEX_NORMAL_SIZE;
        if ((vertexFormat & VertexFormat.UV0) !== 0) stride += VERTEX_UV_SIZE;
        if ((vertexFormat & VertexFormat.UV1) !== 0) stride += VERTEX_UV_SIZE;

        if (vertexCount * stride !== vertexData.length) throw new Error("Vertex count, vertex format and vertex data size don't match.");

        this.vertexFormat = vertexFormat;
        this.meshTopology = meshTopology;
        this.vertexCount = vertexCount;

        // Make sure current VAO is null so we don't modify other VAO when binding buffers
        this.pipelineState.CurrentVAO = undefined;

        this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vertexBuffer);
        this.context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, vertexData, WebGLRenderingContext.STATIC_DRAW);
    }

    protected SetIndexData(indices: Uint16Array): void {

        if (!this.indexBuffer) {
            const indexBuffer = this.context.createBuffer();
            if (indexBuffer === null) throw new Error("Unable to create index buffer.");
            this.indexBuffer = indexBuffer;
            Utils.DebugName(this.indexBuffer, `${this.constructor.name} index buffer`);
        }

        // Make sure current VAO is null so we don't modify other VAO when binding buffers
        this.pipelineState.CurrentVAO = undefined;

        this.indexCount = indices.length;
        this.context.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.context.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, indices, WebGLRenderingContext.STATIC_DRAW);
    }
}