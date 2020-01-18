import { Scene, Materials, Meshes, Entities, Game } from "ts-game-engine";
import { vec4, vec3, quat } from "gl-matrix";
import { IDisposable } from "ts-game-engine/lib/Interfaces";

export class Example1Scene extends Scene {

    private context: WebGLRenderingContext;

    private gridMaterial: Materials.VertexColoredMaterial;
    private gridMesh: Meshes.GridMesh;
    private gridRenderer: Entities.MeshRenderer;

    private monkeyMaterial: Materials.BlinnPhongMaterial;
    private monkeyMesh: Meshes.MDLMesh;
    private monkeyRenderer: Entities.MeshRenderer;

    private lightMesh: Meshes.SphereMesh;

    private customLights: CustomLight[];

    constructor(game: Game) {
        super(game);

        this.context = this.Game.GraphicsSystem.Context;

        this.gridMaterial = new Materials.VertexColoredMaterial(this.context);
        this.gridMesh = new Meshes.GridMesh(this, 10, 10, vec4.fromValues(0.45, 0.3, 0.15, 1));
        this.gridRenderer = new Entities.MeshRenderer(this, "Grid");
        this.gridRenderer.SetMesh(this.gridMesh);
        this.gridRenderer.SetMaterial(this.gridMaterial);

        this.monkeyMaterial = new Materials.BlinnPhongMaterial(this.context);
        this.monkeyRenderer = new Entities.MeshRenderer(this, "Monkey");
        this.monkeyRenderer.SetMaterial(this.monkeyMaterial);
        this.monkeyMesh = new Meshes.MDLMesh(this, "./Monkey.mdl", () => {
            this.monkeyRenderer.SetMesh(this.monkeyMesh);
        });

        this.lightMesh = new Meshes.SphereMesh(this, 12, 6);

        this.customLights = [
            new CustomLight(this, this.lightMesh, vec3.fromValues(3, 3, 4), vec3.fromValues(1, 0.8, 0.4), 4),
            new CustomLight(this, this.lightMesh, vec3.fromValues(-3, 2, -2), vec3.fromValues(0.2, 0.6, 1), 5),
            new CustomLight(this, this.lightMesh, vec3.fromValues(-1, 0, 8), vec3.fromValues(0.6, 1, 0.2), 4),
            new CustomLight(this, this.lightMesh, vec3.fromValues(1, 4, -2), vec3.fromValues(1, 0.2, 0.4), 4)
        ];
    }

    public Start(): void {
        super.Start();

        this.ClearColor = vec4.fromValues(0.15, 0.1, 0.05, 1);
        this.AmbientLight = vec3.fromValues(0.0, 0.0, 0.0);

        this.AddEntity(this.gridRenderer);

        this.monkeyRenderer.Transform.Scale = vec3.fromValues(2, 2, 2);
        this.AddEntity(this.monkeyRenderer);
    }

    public Update(deltaTime: number): void {
        super.Update(deltaTime);

        let currentTime = this.Game.ElapsedSeconds;

        this.Camera.Transform.Position = vec3.fromValues(0, Math.sin(currentTime * 2) + 4.5, 15.0);

        let tempQuat: quat = quat.create();
        quat.fromEuler(tempQuat, -20, 0, 0);
        this.Camera.Transform.Rotation = tempQuat;

        quat.fromEuler(tempQuat, 0, currentTime * 90, 0);
        this.gridRenderer.Transform.Rotation = tempQuat;
        this.monkeyRenderer.Transform.Rotation = tempQuat;
    }

    public Render(): void {
        super.Render();
    }

    public Dispose(): void {
        this.gridRenderer.Dispose();
        this.gridMesh.Dispose();

        this.monkeyRenderer.Dispose();
        this.monkeyMesh.Dispose();

        this.lightMesh.Dispose();

        for (let l: number = 0; l < this.customLights.length; l++) this.customLights[l].Dispose();

        super.Dispose();
    }
}

class CustomLight implements IDisposable {

    private light: Entities.Light;
    private material: Materials.UnlitColoredMaterial;
    private renderer: Entities.MeshRenderer;

    constructor(scene: Scene, mesh: Meshes.Mesh, position: vec3, color: vec3, intensity: number) {

        this.light = new Entities.Light(scene, "Light");
        this.material = new Materials.UnlitColoredMaterial(scene.Game.GraphicsSystem.Context);
        this.renderer = new Entities.MeshRenderer(scene, "Mesh Light");
        this.renderer.SetMesh(mesh);
        this.renderer.SetMaterial(this.material);

        this.light.Transform.Position = position;
        this.light.Color = color;
        this.light.Intensity = intensity;
        scene.AddEntity(this.light);
        this.material.Color = this.light.Color;
        this.renderer.Transform.Position = this.light.Transform.Position;
        this.renderer.Transform.Scale = vec3.fromValues(0.2, 0.2, 0.2);
        scene.AddEntity(this.renderer);
    }

    public Dispose(): void {
        this.light.Dispose();
        this.renderer.Dispose();
    }
}