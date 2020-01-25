import { IDisposable } from "./Interfaces";
import { vec4, vec3 } from "gl-matrix";
import { Game } from "./Game";
import { Entity, Camera, MeshRenderer, Light } from "./Entities";
import { FaceCullingModes, DepthFunctions } from "./Systems/Graphics/PipelineState";
import { FLOAT_SIZE, MAX_LIGHTS, LIGHT_DATA_SIZE } from "./Constants";

export abstract class Scene implements IDisposable {

    private game: Game;
    get Game(): Game { return this.game; }

    private camera: Camera;
    get Camera(): Camera { return this.camera; }

    get ClearColor(): vec4 { return this.game.GraphicsSystem.PipelineState.ClearColor; }
    set ClearColor(clearColor: vec4) { this.game.GraphicsSystem.PipelineState.ClearColor = clearColor; }

    private ambientLight: vec3;
    get AmbientLight(): vec3 { return this.ambientLight; }
    set AmbientLight(ambientLight: vec3) { this.ambientLight = ambientLight; }

    private entities: Set<Entity> = new Set<Entity>();
    private meshRenderers: Set<MeshRenderer> = new Set<MeshRenderer>();
    private lights: Set<Light> = new Set<Light>();

    private pointLightsData: Float32Array = new Float32Array(MAX_LIGHTS * LIGHT_DATA_SIZE * FLOAT_SIZE);
    get PointLightsData(): Float32Array { return this.pointLightsData; }
    get PointLightsCount(): number { return Math.min(this.lights.size, MAX_LIGHTS); }

    constructor(game: Game) {
        this.game = game;

        this.game.GraphicsSystem.PipelineState.FaceCulling = true;
        this.game.GraphicsSystem.PipelineState.FaceCullingMode = FaceCullingModes.Back;
        this.game.GraphicsSystem.PipelineState.DepthTest = true;
        this.game.GraphicsSystem.PipelineState.DepthFunction = DepthFunctions.Less;

        this.camera = new Camera(this, "Main Camera");
        this.ClearColor = vec4.fromValues(0, 0, 0, 0);
        this.ambientLight = vec3.create();
    }

    public Dispose(): void {
        this.entities.clear();
        this.meshRenderers.clear();
        this.lights.clear();
    }

    public Start(): void { }

    public Update(deltaTime: number): void { }

    public Render(): void {

        this.BuildLightsData();

        for (let meshRenderer of this.meshRenderers) {
            meshRenderer.Render();
        }
    }

    public Resize(width: number, height: number): void {
        this.camera.Resize(width, height);
    }

    public AddEntity(entity: Entity): void {
        this.entities.add(entity);
        if (entity instanceof MeshRenderer) this.meshRenderers.add(entity);
        if (entity instanceof Light) this.lights.add(entity);
    }

    public RemoveEntity(entity: Entity): void {
        this.entities.delete(entity);
        if (entity instanceof MeshRenderer) this.meshRenderers.delete(entity);
        if (entity instanceof Light) this.lights.delete(entity);
    }

    private BuildLightsData(): void {
        const stride: number = LIGHT_DATA_SIZE * FLOAT_SIZE;
        let count: number = 0;

        // Fill point light data into the list

        for (let light of this.lights) {
            let index: number = count * stride;

            this.pointLightsData[index + 0] = light.Transform.Position[0];
            this.pointLightsData[index + 1] = light.Transform.Position[1];
            this.pointLightsData[index + 2] = light.Transform.Position[2];
            this.pointLightsData[index + 3] = light.Intensity;

            this.pointLightsData[index + 4] = light.Color[0];
            this.pointLightsData[index + 5] = light.Color[1];
            this.pointLightsData[index + 6] = light.Color[2];
            this.pointLightsData[index + 7] = 0;

            count++;
            if (count >= MAX_LIGHTS) break; // Render MAX_LIGHTS lights at most
        }
    }
}