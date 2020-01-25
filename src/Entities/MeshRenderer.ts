import { Entity } from "./Entity";
import { Scene } from "../Scene";
import { Mesh, VertexFormat, ATTRIBUTE_INFO, VERTEX_POSITION_SIZE, VERTEX_COLOR_SIZE } from "../Meshes";
import { Material, VertexColoredMaterial, POSITION_ATTRIBUTE, COLOR_ATTRIBUTE } from "../Materials";
import { IRenderable, IGlobalUniforms, IDisposable, IBoundingBox } from "../Interfaces";
import { PipelineState } from "../Systems/Graphics/PipelineState";
import { GraphicsSystem } from "../Systems/Graphics/GraphicsSystem";
import { FLOAT_SIZE } from "../Constants";
import { Utils } from "../Utils";
import { WireBoxMesh } from "../Meshes/WireBoxMesh";
import { vec4 } from "gl-matrix";

export class MeshRenderer extends Entity implements IRenderable, IDisposable {

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
        this.graphicsSystem.Ext_VAO.deleteVertexArrayOES(this.vao);
        this.DisposeBoundsDebug();
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

        this.RenderBoundsDebug();
    }

    public SetMesh(mesh: Mesh): void {
        if (this.mesh === mesh) return;

        if (!mesh.IsLoaded) {
            console.error(`Trying to set a mesh into "${this.Name}" MeshRenderer while it still didn't finish loading.`);
            return;
        }

        this.mesh = mesh;
        this.UpdateVAO();

        this.CreateBoundsDebug(mesh.BoundingBox);
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
            pointLightsData: this.Scene.PointLightsData,
            pointLightsCount: this.Scene.PointLightsCount
        }
    }

    private UpdateGlobalUniforms(): void {
        this.globalUniforms.modelMatrix = this.Transform.ModelMatrix;
        this.globalUniforms.viewMatrix = this.Scene.Camera.ViewMatrix;
        this.globalUniforms.projectionMatrix = this.Scene.Camera.ProjectionMatrix;
        this.globalUniforms.normalMatrix = this.Transform.NormalMatrix;
        this.globalUniforms.viewPosition = this.Scene.Camera.Transform.Position;
        this.globalUniforms.ambientLight = this.Scene.AmbientLight;
        this.globalUniforms.pointLightsData = this.Scene.PointLightsData;
        this.globalUniforms.pointLightsCount = this.Scene.PointLightsCount;
    }

    // Bounds debug -----------------------------------------------------------------------------------------------------------

    private boundingBoxMesh: WireBoxMesh | undefined;
    private boundingBoxMaterial: VertexColoredMaterial | undefined;
    private boundingBoxVAO: WebGLVertexArrayObjectOES | undefined;

    private CreateBoundsDebug(boundingBox: IBoundingBox): void {

        // Create mesh

        if (this.boundingBoxMesh !== undefined) {
            this.boundingBoxMesh.Dispose();
        }

        this.boundingBoxMesh = new WireBoxMesh(this.Scene, boundingBox, vec4.fromValues(0, 1, 0, 1));

        // Create material

        if (this.boundingBoxMaterial === undefined) {
            this.boundingBoxMaterial = new VertexColoredMaterial(this.Scene);
        }

        // Create VAO

        if (this.boundingBoxVAO !== undefined) {
            this.graphicsSystem.Ext_VAO.deleteVertexArrayOES(this.boundingBoxVAO);
        }

        let vao: WebGLVertexArrayObjectOES | null = this.graphicsSystem.Ext_VAO.createVertexArrayOES();
        if (vao === null) throw new Error("Unable to create bounding box Vertex Attribute Object.");
        this.boundingBoxVAO = vao;
        Utils.DebugName(this.boundingBoxVAO, `${this.Name} bounding box VAO`);

        // Configure VAO

        this.pipelineState.CurrentVAO = this.boundingBoxVAO;
        this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.boundingBoxMesh.VertexBuffer);
        this.context.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.boundingBoxMesh.IndexBuffer !== undefined ? this.boundingBoxMesh.IndexBuffer : null);

        let stride: number = (FLOAT_SIZE * VERTEX_POSITION_SIZE) + (FLOAT_SIZE * VERTEX_COLOR_SIZE);

        let attributeLocation: number | undefined = this.boundingBoxMaterial.Shader.Attributes.get(POSITION_ATTRIBUTE);
        if (attributeLocation !== undefined) {
            this.context.vertexAttribPointer(attributeLocation, VERTEX_POSITION_SIZE, WebGLRenderingContext.FLOAT, false, stride, 0);
            this.context.enableVertexAttribArray(attributeLocation);
        }

        attributeLocation = this.boundingBoxMaterial.Shader.Attributes.get(COLOR_ATTRIBUTE);
        if (attributeLocation !== undefined) {
            this.context.vertexAttribPointer(attributeLocation, VERTEX_COLOR_SIZE, WebGLRenderingContext.FLOAT, false, stride, FLOAT_SIZE * VERTEX_POSITION_SIZE);
            this.context.enableVertexAttribArray(attributeLocation);
        }
    }

    private RenderBoundsDebug(): void {
        if (this.boundingBoxMesh === undefined) return;
        if (this.boundingBoxMaterial === undefined) return;

        this.pipelineState.CurrentShader = this.boundingBoxMaterial.Shader;
        this.boundingBoxMaterial.SetUniforms(this.globalUniforms);

        this.pipelineState.CurrentVAO = this.boundingBoxVAO;

        if (this.boundingBoxMesh.IndexBuffer)
            this.context.drawElements(this.boundingBoxMesh.MeshTopology, this.boundingBoxMesh.IndexCount, WebGLRenderingContext.UNSIGNED_SHORT, 0);
        else
            this.context.drawArrays(this.boundingBoxMesh.MeshTopology, 0, this.boundingBoxMesh.VertexCount);
    }

    private DisposeBoundsDebug(): void {
        if (this.boundingBoxMesh !== undefined) this.boundingBoxMesh.Dispose();
        if (this.boundingBoxVAO !== undefined) this.graphicsSystem.Ext_VAO.deleteVertexArrayOES(this.boundingBoxVAO);
    }
}