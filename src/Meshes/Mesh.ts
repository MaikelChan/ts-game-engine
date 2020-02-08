import { IDisposable, IAttributeTypeInfo } from "../Interfaces";
import { POSITION_ATTRIBUTE, COLOR_ATTRIBUTE, NORMAL_ATTRIBUTE, UV0_ATTRIBUTE, UV1_ATTRIBUTE, POSITION_ATTRIBUTE_LOCATION, UV1_ATTRIBUTE_LOCATION, UV0_ATTRIBUTE_LOCATION, NORMAL_ATTRIBUTE_LOCATION, COLOR_ATTRIBUTE_LOCATION } from "../Constants";
import { PipelineState } from "../Systems/Graphics/PipelineState";
import { Scene } from "../Scene";
import { Utils } from "../Utils";
import { vec3 } from "gl-matrix";
import { BoundingBox } from "../Math/BoundingBox";

export const enum VertexFormat { Position = 1, Color = 2, Normal = 4, UV0 = 8, UV1 = 16 }
export const enum IndexFormat { UInt16, UInt32 }
export const enum MeshTopology { Points = 0x0000, Lines = 0x0001, LineLoop = 0x0002, LineStrip = 0x0003, Triangles = 0x0004, TriangleStrip = 0x0005, TriangleFan = 0x0006 }

export const VERTEX_POSITION_SIZE: number = 3; // X, Y, Z
export const VERTEX_COLOR_SIZE: number = 4; // R, G, B, A
export const VERTEX_NORMAL_SIZE: number = 3; // X, Y, Z
export const VERTEX_UV_SIZE: number = 2; // X, Y

export const ATTRIBUTE_INFO: IAttributeTypeInfo[] = [
    { vertexFormat: VertexFormat.Position, name: POSITION_ATTRIBUTE, location: POSITION_ATTRIBUTE_LOCATION, size: VERTEX_POSITION_SIZE },
    { vertexFormat: VertexFormat.Color, name: COLOR_ATTRIBUTE, location: COLOR_ATTRIBUTE_LOCATION, size: VERTEX_COLOR_SIZE },
    { vertexFormat: VertexFormat.Normal, name: NORMAL_ATTRIBUTE, location: NORMAL_ATTRIBUTE_LOCATION, size: VERTEX_NORMAL_SIZE },
    { vertexFormat: VertexFormat.UV0, name: UV0_ATTRIBUTE, location: UV0_ATTRIBUTE_LOCATION, size: VERTEX_UV_SIZE },
    { vertexFormat: VertexFormat.UV1, name: UV1_ATTRIBUTE, location: UV1_ATTRIBUTE_LOCATION, size: VERTEX_UV_SIZE }
]

export class Mesh implements IDisposable {

    private context: WebGL2RenderingContext;
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

    private boundingBox: BoundingBox;
    get BoundingBox(): BoundingBox { return this.boundingBox; }

    private isVertexBufferDynamic: boolean;

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

        this.boundingBox = new BoundingBox();

        this.isVertexBufferDynamic = false;
    }

    Dispose(): void {
        this.isLoaded = false;

        if (this.vertexBuffer) this.context.deleteBuffer(this.vertexBuffer);
        if (this.indexBuffer) this.context.deleteBuffer(this.indexBuffer);
    }

    protected SetVertexData(vertexFormat: VertexFormat, meshTopology: MeshTopology, vertexCount: number, vertexData: Float32Array, isDynamic: boolean): void {
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

        // It's not necessary to unbind the current VAO, as binding an array buffer won't modify the
        // array buffer/s of the current VAO. They are referenced in the vertexAttribPointer calls, not in the VAO.

        this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.vertexBuffer);
        this.context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, vertexData, isDynamic ? WebGL2RenderingContext.DYNAMIC_DRAW : WebGL2RenderingContext.STATIC_DRAW);
        this.isVertexBufferDynamic = isDynamic;
    }

    protected UpdateVertexData(vertexData: Float32Array): void {
        if (!this.isVertexBufferDynamic) {
            console.error(`${this.constructor.name}'s vertex buffer is not dynamic.`);
            return;
        }

        // It's not necessary to unbind the current VAO, as binding an array buffer won't modify the
        // array buffer/s of the current VAO. They are referenced in the vertexAttribPointer calls, not in the VAO.

        this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.vertexBuffer);
        this.context.bufferSubData(WebGL2RenderingContext.ARRAY_BUFFER, 0, vertexData);
    }

    protected SetIndexData(indices: Uint16Array): void {

        if (!this.indexBuffer) {
            const indexBuffer = this.context.createBuffer();
            if (indexBuffer === null) throw new Error("Unable to create index buffer.");
            this.indexBuffer = indexBuffer;
            Utils.DebugName(this.indexBuffer, `${this.constructor.name} index buffer`);
        }

        // Make sure current VAO is null so we don't accidentally modify the element buffer of other VAO.
        // Unlike array buffers, element buffers are actually referenced directly in the VAO.
        this.pipelineState.CurrentVAO = undefined;

        this.indexCount = indices.length;
        this.context.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.context.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, indices, WebGL2RenderingContext.STATIC_DRAW);
    }

    protected SetBounds(min: vec3, max: vec3) {
        this.boundingBox.min = min;
        this.boundingBox.max = max;
    }
}