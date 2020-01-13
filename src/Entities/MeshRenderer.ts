import { Entity } from "./Entity";
import { Scene } from "../Scene";
import { Mesh, VertexFormat, ATTRIBUTE_INFO } from "../Meshes";
import { Material } from "../Materials";
import { IRenderable, IGlobalUniforms } from "../Interfaces";
import { PipelineState } from "../Systems/Graphics/PipelineState";
import { GraphicsSystem } from "../Systems/Graphics/GraphicsSystem";
import { FLOAT_SIZE } from "../Constants";
import { Utils } from "../Utils";

export class MeshRenderer extends Entity implements IRenderable {

    private readonly graphicsSystem: GraphicsSystem;
    private readonly context: WebGLRenderingContext;
    private readonly pipelineState: PipelineState;

    private mesh: Mesh | undefined;
    get Mesh(): Mesh | undefined { return this.mesh; }

    private material: Material | undefined;
    get Material(): Material | undefined { return this.material; }

    get IsRenderable(): boolean { return this.mesh !== undefined && this.material !== undefined; }

    private vao: WebGLVertexArrayObjectOES;

    private globalUniforms: IGlobalUniforms;

    constructor(scene: Scene, name: string) {
        super(scene, name);

        this.graphicsSystem = scene.Game.GraphicsSystem;
        this.context = this.graphicsSystem.Context;
        this.pipelineState = this.graphicsSystem.PipelineState;

        let vao: WebGLVertexArrayObjectOES | null = this.graphicsSystem.Ext_VAO.createVertexArrayOES();
        if (vao === null) throw new Error("Unable to create Vertex Attribute Object.");
        this.vao = vao;
        Utils.DebugName(this.vao, `${this.Name} VAO`);

        this.globalUniforms = this.CreateGlobalUniformsObject();
    }

    public Dispose(): void {
        super.Dispose();

        this.graphicsSystem.Ext_VAO.deleteVertexArrayOES(this.vao);
    }

    public Render(): void {
        if (this.mesh === undefined) return;
        if (this.material === undefined) return;

        this.pipelineState.CurrentShader = this.material.Shader;
        this.UpdateGlobalUniforms();
        this.material.SetUniforms(this.globalUniforms);

        this.pipelineState.CurrentVAO = this.vao;

        if (this.mesh.IndexBuffer)
            this.context.drawElements(this.mesh.MeshTopology, this.mesh.IndexCount, WebGLRenderingContext.UNSIGNED_SHORT, 0);
        else
            this.context.drawArrays(this.mesh.MeshTopology, 0, this.mesh.VertexCount);
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

    public SetMaterial(material: Material): void {
        if (this.material === material) return;
        this.material = material;
        this.UpdateVAO();
    }

    private UpdateVAO(): void {
        if (this.mesh === undefined) return;
        if (this.material === undefined) return;

        this.pipelineState.CurrentVAO = this.vao;
        this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.mesh.VertexBuffer);
        this.context.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.mesh.IndexBuffer !== undefined ? this.mesh.IndexBuffer : null);

        const vertexFormat: VertexFormat = this.mesh.VertexFormat;

        let stride: number = 0;
        for (let f: number = 0; f < ATTRIBUTE_INFO.length; f++) {
            if ((vertexFormat & ATTRIBUTE_INFO[f].vertexFormat) !== 0) stride += FLOAT_SIZE * ATTRIBUTE_INFO[f].size;
        }

        let offset: number = 0;
        for (let f: number = 0; f < ATTRIBUTE_INFO.length; f++) {
            if ((vertexFormat & ATTRIBUTE_INFO[f].vertexFormat) !== 0) {
                let attributeLocation: number | undefined = this.material.Shader.Attributes.get(ATTRIBUTE_INFO[f].name);
                if (attributeLocation !== undefined) {
                    this.context.vertexAttribPointer(attributeLocation, ATTRIBUTE_INFO[f].size, WebGLRenderingContext.FLOAT, false, stride, offset);
                    this.context.enableVertexAttribArray(attributeLocation);
                    offset += FLOAT_SIZE * ATTRIBUTE_INFO[f].size;
                }
            }
        }
    }

    private CreateGlobalUniformsObject(): IGlobalUniforms {
        return {
            modelMatrix: this.Transform.ModelMatrix,
            viewMatrix: this.Scene.Camera.ViewMatrix,
            projectionMatrix: this.Scene.Camera.ProjectionMatrix,
            normalMatrix: this.Transform.NormalMatrix,
            viewPosition: this.Scene.Camera.Transform.Position,
            ambientLight: this.Scene.AmbientLight,
            lightsData: this.Scene.LightsData
        }
    }

    private UpdateGlobalUniforms(): void {
        this.globalUniforms.modelMatrix = this.Transform.ModelMatrix;
        this.globalUniforms.viewMatrix = this.Scene.Camera.ViewMatrix;
        this.globalUniforms.projectionMatrix = this.Scene.Camera.ProjectionMatrix;
        this.globalUniforms.normalMatrix = this.Transform.NormalMatrix;
        this.globalUniforms.viewPosition = this.Scene.Camera.Transform.Position;
        this.globalUniforms.ambientLight = this.Scene.AmbientLight;
        this.globalUniforms.lightsData = this.Scene.LightsData;
    }
}