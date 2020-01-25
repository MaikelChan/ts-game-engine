import { IDisposable, IVertexData, IAttributeTypeInfo, IBoundingBox, IBoundingSphere } from "../Interfaces";
import { POSITION_ATTRIBUTE, COLOR_ATTRIBUTE, NORMAL_ATTRIBUTE, UV0_ATTRIBUTE, UV1_ATTRIBUTE } from "../Materials/Shader";
import { PipelineState } from "../Systems/Graphics/PipelineState";
import { Scene } from "../Scene";
import { Utils } from "../Utils";
import { vec3 } from "gl-matrix";

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

    private boundingBox: IBoundingBox;
    get BoundingBox(): IBoundingBox { return this.boundingBox; }

    private boundingSphere: IBoundingSphere;
    get BoundingSphere(): IBoundingSphere { return this.boundingSphere; }

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

        this.boundingBox = { min: vec3.create(), max: vec3.create() }
        this.boundingSphere = { center: vec3.create(), radius: 0 }
    }

    Dispose(): void {
        this.isLoaded = false;

        if (this.vertexBuffer) this.context.deleteBuffer(this.vertexBuffer);
        if (this.indexBuffer) this.context.deleteBuffer(this.indexBuffer);
    }

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

    protected SetBounds(boundingBox: IBoundingBox, boundingSphere: IBoundingSphere) {
        this.boundingBox = boundingBox;
        this.boundingSphere = boundingSphere;
    }
}