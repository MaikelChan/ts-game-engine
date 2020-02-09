import { Entity } from "./Entity";
import { Scene } from "../Scene";
import { Mesh, VertexFormat, ATTRIBUTE_INFO, VERTEX_POSITION_SIZE, VERTEX_COLOR_SIZE } from "../Meshes";
import { Material, VertexColoredMaterial } from "../Materials";
import { IRenderable, IGlobalUniforms, IDisposable } from "../Interfaces";
import { PipelineState } from "../Systems/Graphics/PipelineState";
import { FLOAT_SIZE, COLOR_ATTRIBUTE_LOCATION, POSITION_ATTRIBUTE_LOCATION } from "../Constants";
import { Utils } from "../Utils";
import { WireBoxMesh } from "../Meshes/WireBoxMesh";
import { vec4, vec3, mat4 } from "gl-matrix";
import { BoundingBox } from "../Math/BoundingBox";
import { IntersectionResults } from "../Math/Frustum";

export class MeshRenderer extends Entity implements IRenderable, IDisposable {

    protected readonly culling: boolean;

    protected readonly context: WebGL2RenderingContext;
    protected readonly pipelineState: PipelineState;

    protected mesh: Mesh | undefined;
    get Mesh(): Mesh | undefined { return this.mesh; }

    protected material: Material | undefined;
    get Material(): Material | undefined { return this.material; }

    get IsRenderable(): boolean { return this.mesh !== undefined && this.material !== undefined; }

    private aabb: BoundingBox;

    protected vao: WebGLVertexArrayObject;

    constructor(scene: Scene, name: string, culling: boolean = true) {
        super(scene, name);

        this.culling = culling;

        this.context = scene.Game.GraphicsSystem.Context;
        this.pipelineState = scene.Game.GraphicsSystem.PipelineState;

        let vao: WebGLVertexArrayObject | null = this.context.createVertexArray();
        if (vao === null) throw new Error("Unable to create Vertex Array Object.");
        this.vao = vao;
        Utils.DebugName(this.vao, `${this.Name} VAO`);

        this.aabb = new BoundingBox();

        this.Transform.OnTransformChange = () => this.UpdateAABB();
    }

    public Dispose(): void {
        this.context.deleteVertexArray(this.vao);
        this.DisposeBoundsDebug();
    }

    public Render(): void {
        if (this.mesh === undefined) return;
        if (this.material === undefined) return;
        if (this.IsCulled()) return;

        this.pipelineState.CurrentShader = this.material.Shader;
        const globalUniforms: IGlobalUniforms = this.GetGlobalUniformsObject();
        this.material.SetUniforms(globalUniforms);

        this.pipelineState.CurrentVAO = this.vao;

        if (this.mesh.IndexBuffer)
            this.context.drawElements(this.mesh.MeshTopology, this.mesh.IndexCount, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        else
            this.context.drawArrays(this.mesh.MeshTopology, 0, this.mesh.VertexCount);

        this.RenderBoundsDebug(globalUniforms);
    }

    public SetMesh(mesh: Mesh): void {
        if (this.mesh === mesh) return;

        if (!mesh.IsLoaded) {
            console.error(`Trying to set a mesh into "${this.Name}" MeshRenderer while it still didn't finish loading.`);
            return;
        }

        this.mesh = mesh;
        this.UpdateVAO();

        this.UpdateAABB();
        this.CreateBoundsDebug();
    }

    public SetMaterial(material: Material): void {
        if (this.material === material) return;
        this.material = material;
        this.UpdateVAO();
    }

    protected UpdateVAO(): void {
        if (this.mesh === undefined) return;
        if (this.material === undefined) return;

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
    }

    protected GetGlobalUniformsObject(): IGlobalUniforms {
        return {
            modelMatrix: this.Transform.ModelMatrix,
            viewMatrix: this.Scene.Camera.ViewMatrix,
            projectionMatrix: this.Scene.Camera.ProjectionMatrix,
            viewDirectionProjectionInverseMatrix: this.Scene.Camera.ViewDirectionProjectionInverseMatrix,
            normalMatrix: this.Transform.NormalMatrix,
            viewPosition: this.Scene.Camera.Transform.Position,
            ambientLight: this.Scene.AmbientLight,
            pointLightsData: this.Scene.PointLightsData,
            pointLightsCount: this.Scene.PointLightsCount
        }
    }

    // Bounds and Culling -----------------------------------------------------------------------------------------------------

    protected UpdateAABB(): void {
        if (!this.culling) return;
        if (this.mesh === undefined) return;

        let points: vec3[] = this.mesh.BoundingBox.GetPoints();

        this.aabb.min[0] = Number.MAX_VALUE; this.aabb.min[1] = Number.MAX_VALUE; this.aabb.min[2] = Number.MAX_VALUE;
        this.aabb.max[0] = -Number.MAX_VALUE; this.aabb.max[1] = -Number.MAX_VALUE; this.aabb.max[2] = -Number.MAX_VALUE;

        for (let p: number = 0; p < points.length; p++) {
            let point = vec3.transformMat4(points[p], points[p], this.Transform.ModelMatrix);

            if (point[0] < this.aabb.min[0]) this.aabb.min[0] = point[0];
            else if (point[0] > this.aabb.max[0]) this.aabb.max[0] = point[0];

            if (point[1] < this.aabb.min[1]) this.aabb.min[1] = point[1];
            else if (point[1] > this.aabb.max[1]) this.aabb.max[1] = point[1];

            if (point[2] < this.aabb.min[2]) this.aabb.min[2] = point[2];
            else if (point[2] > this.aabb.max[2]) this.aabb.max[2] = point[2];
        }

        this.aabbMeshDirty = true;
    }

    protected IsCulled(): boolean {
        if (!this.culling) return false;
        return this.Scene.Camera.Frustum.CheckBoundsIntersection(this.aabb) === IntersectionResults.Outside;
    }

    // Bounds debug -----------------------------------------------------------------------------------------------------------

    private aabbMesh: WireBoxMesh | undefined;
    private aabbMaterial: VertexColoredMaterial | undefined;
    private aabbVAO: WebGLVertexArrayObject | undefined;

    private aabbMeshDirty: boolean = false;

    private readonly aabbColor: vec4 = vec4.fromValues(0.1, 1, 0.45, 1);

    private CreateBoundsDebug(): void {
        if (!this.culling) return;

        // Create mesh

        if (this.aabbMesh !== undefined) {
            this.aabbMesh.Dispose();
        }

        this.aabbMesh = new WireBoxMesh(this.Scene, this.aabb, this.aabbColor);

        // Create material

        if (this.aabbMaterial === undefined) {
            this.aabbMaterial = new VertexColoredMaterial(this.Scene);
        }

        // Create VAO

        if (this.aabbVAO !== undefined) {
            this.context.deleteVertexArray(this.aabbVAO);
        }

        let vao: WebGLVertexArrayObject | null = this.context.createVertexArray();
        if (vao === null) throw new Error("Unable to create bounding box Vertex Array Object.");
        this.aabbVAO = vao;
        Utils.DebugName(this.aabbVAO, `${this.Name} bounding box VAO`);

        // Configure VAO

        this.pipelineState.CurrentVAO = this.aabbVAO;
        this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.aabbMesh.VertexBuffer);
        this.context.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.aabbMesh.IndexBuffer !== undefined ? this.aabbMesh.IndexBuffer : null);

        let stride: number = (FLOAT_SIZE * VERTEX_POSITION_SIZE) + (FLOAT_SIZE * VERTEX_COLOR_SIZE);

        this.context.vertexAttribPointer(POSITION_ATTRIBUTE_LOCATION, VERTEX_POSITION_SIZE, WebGL2RenderingContext.FLOAT, false, stride, 0);
        this.context.enableVertexAttribArray(POSITION_ATTRIBUTE_LOCATION);

        this.context.vertexAttribPointer(COLOR_ATTRIBUTE_LOCATION, VERTEX_COLOR_SIZE, WebGL2RenderingContext.FLOAT, false, stride, FLOAT_SIZE * VERTEX_POSITION_SIZE);
        this.context.enableVertexAttribArray(COLOR_ATTRIBUTE_LOCATION);
    }

    private RenderBoundsDebug(globalUniforms: IGlobalUniforms): void {
        if (!this.culling) return;
        if (!this.Scene.Game.Settings.ShowBounds) return;
        if (this.aabbMesh === undefined) return;
        if (this.aabbMaterial === undefined) return;
        if (this.aabbVAO === undefined) return;

        if (this.aabbMeshDirty) {
            this.aabbMesh.UpdateBounds(this.aabb, this.aabbColor);
            this.aabbMeshDirty = false;
        }

        this.pipelineState.CurrentShader = this.aabbMaterial.Shader;
        globalUniforms.modelMatrix = mat4.create(); // Override model matrix as we don't use it for AABB
        this.aabbMaterial.SetUniforms(globalUniforms);

        this.pipelineState.CurrentVAO = this.aabbVAO;

        if (this.aabbMesh.IndexBuffer)
            this.context.drawElements(this.aabbMesh.MeshTopology, this.aabbMesh.IndexCount, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        else
            this.context.drawArrays(this.aabbMesh.MeshTopology, 0, this.aabbMesh.VertexCount);
    }

    private DisposeBoundsDebug(): void {
        if (this.aabbMesh !== undefined) this.aabbMesh.Dispose();
        if (this.aabbVAO !== undefined) this.context.deleteVertexArray(this.aabbVAO);
    }
}