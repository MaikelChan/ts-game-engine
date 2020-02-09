import { Scene } from "../Scene";
import { Mesh, VertexFormat, ATTRIBUTE_INFO } from "../Meshes";
import { IGlobalUniforms, IInstancedAttributeData } from "../Interfaces";
import { FLOAT_SIZE, INSTANCE_MATRIX_ATTRIBUTE, MATRIX_4X4_SIZE } from "../Constants";
import { MeshRenderer } from "./MeshRenderer";
import { Utils } from "../Utils";

export class MeshRendererInstanced extends MeshRenderer {

    private maxInstances: number;
    private instances: number;

    private instancedBuffers: Map<string, IInstancedAttributeData>;

    constructor(scene: Scene, name: string, maxInstances: number) {
        super(scene, name, false);

        this.maxInstances = maxInstances;
        this.instances = 0;

        this.instancedBuffers = new Map<string, IInstancedAttributeData>();
    }

    public Dispose(): void {
        for (let value of this.instancedBuffers.values()) {
            this.context.deleteBuffer(value.buffer);
        }

        this.instancedBuffers.clear();

        super.Dispose();
    }

    public Render(): void {
        if (this.mesh === undefined) return;
        if (this.material === undefined) return;
        if (this.instancedBuffers.size === 0) return;

        this.pipelineState.CurrentShader = this.material.Shader;
        const globalUniforms: IGlobalUniforms = this.GetGlobalUniformsObject();
        this.material.SetUniforms(globalUniforms);

        this.pipelineState.CurrentVAO = this.vao;

        if (this.mesh.IndexBuffer)
            this.context.drawElementsInstanced(this.mesh.MeshTopology, this.mesh.IndexCount, WebGL2RenderingContext.UNSIGNED_SHORT, 0, this.instances);
        else
            this.context.drawArraysInstanced(this.mesh.MeshTopology, 0, this.mesh.VertexCount, this.instances);
    }

    public SetMesh(mesh: Mesh): void {
        if (this.mesh === mesh) return;

        if (!mesh.IsLoaded) {
            console.error(`Trying to set a mesh into "${this.Name}" MeshRenderer while it still didn't finish loading.`);
            return;
        }

        this.mesh = mesh;
        this.UpdateVAO();
    }

    public SetMatrices(instances: number, data: Float32Array) {
        this.SetInstancedAttribute(INSTANCE_MATRIX_ATTRIBUTE, MATRIX_4X4_SIZE, instances, data);
    }

    public SetInstancedAttribute(instancedAttribute: string, instanceDataSize: number, instances: number, data: Float32Array): void {
        if (this.material === undefined) {
            console.warn("First set a material before calling SetInstancedProperty.");
            return;
        }

        let location: number | undefined = this.material.Shader.InstancedAttributes.get(instancedAttribute);
        if (location === undefined) {
            console.warn(`Instanced attribute "${instancedAttribute}" does not exist in the current material.`);
            return;
        }

        const maxBufferSize: number = this.maxInstances * instanceDataSize;
        if (data.byteLength > maxBufferSize) {
            console.warn(`Can't set instanced attribute "${instancedAttribute}" data that is bigger than its initial size (${data.byteLength} > ${maxBufferSize}).`);
            return;
        }

        this.SetInstanceCount(instances);

        let instancedBuffer: IInstancedAttributeData | undefined = this.instancedBuffers.get(instancedAttribute);
        if (instancedBuffer === undefined) {
            const buffer = this.context.createBuffer();
            if (buffer === null) throw new Error("Unable to create instanced buffer.");
            Utils.DebugName(buffer, `${instancedAttribute} instanced buffer`);

            instancedBuffer = { location: location, buffer: buffer, bufferSize: maxBufferSize, instanceDataSize: instanceDataSize };
            this.instancedBuffers.set(instancedAttribute, instancedBuffer);

            this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, instancedBuffer.buffer);
            this.context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, instancedBuffer.bufferSize, WebGL2RenderingContext.DYNAMIC_DRAW);
            this.context.bufferSubData(WebGL2RenderingContext.ARRAY_BUFFER, 0, data);

            this.UpdateVAO();
        }
        else {
            this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, instancedBuffer.buffer);
            this.context.bufferSubData(WebGL2RenderingContext.ARRAY_BUFFER, 0, data);
        }
    }

    public SetInstanceCount(instances: number) {
        this.instances = instances;
    }

    protected UpdateVAO(): void {
        if (this.mesh === undefined) return;
        if (this.material === undefined) return;
        if (this.instancedBuffers.size === 0) return;

        this.pipelineState.CurrentVAO = this.vao;
        this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.mesh.VertexBuffer);
        this.context.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.mesh.IndexBuffer !== undefined ? this.mesh.IndexBuffer : null);

        const vertexFormat: VertexFormat = this.mesh.VertexFormat;

        let stride: number = 0;
        for (let f: number = 0; f < ATTRIBUTE_INFO.length; f++) {
            if ((vertexFormat & ATTRIBUTE_INFO[f].vertexFormat) !== 0) stride += FLOAT_SIZE * ATTRIBUTE_INFO[f].size;
        }

        let offset: number = 0;
        for (let f: number = 0; f < ATTRIBUTE_INFO.length; f++) {
            if ((vertexFormat & ATTRIBUTE_INFO[f].vertexFormat) !== 0) {
                this.context.vertexAttribPointer(ATTRIBUTE_INFO[f].location, ATTRIBUTE_INFO[f].size, WebGL2RenderingContext.FLOAT, false, stride, offset);
                this.context.enableVertexAttribArray(ATTRIBUTE_INFO[f].location);
                offset += FLOAT_SIZE * ATTRIBUTE_INFO[f].size;
            }
        }

        for (let instancedBuffer of this.instancedBuffers.values()) {
            this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, instancedBuffer.buffer);

            // For example, a matrix4 is actually 4 vec4
            const amountOfVec4: number = instancedBuffer.instanceDataSize / 16;

            for (let i: number = 0; i < amountOfVec4; i++) {
                this.context.vertexAttribPointer(instancedBuffer.location + i, 4, WebGL2RenderingContext.FLOAT, false, instancedBuffer.instanceDataSize, i * 16);
                this.context.vertexAttribDivisor(instancedBuffer.location + i, 1);
                this.context.enableVertexAttribArray(instancedBuffer.location + i);
            }
        }
    }

    // Bounds and Culling -----------------------------------------------------------------------------------------------------

    protected UpdateAABB(): void {

    }

    protected IsCulled(): boolean {
        return false;
    }
}