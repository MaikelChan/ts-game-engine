import { Scene, Materials, Meshes, Entities, Game, Texture2D, InputSystem, Keys } from "ts-game-engine";
import { vec4, vec3, quat, vec2 } from "gl-matrix";
import { IDisposable } from "ts-game-engine/lib/Interfaces";

const MOUSE_SENSITIVITY: number = 0.15;
const MOVEMENT_SPEED: number = 10;

export class Example1Scene extends Scene {

    private gridMaterial: Materials.VertexColoredMaterial;
    private gridMesh: Meshes.GridMesh;
    private gridRenderer: Entities.MeshRenderer;

    private monkeyMaterial1: Materials.BlinnPhongMaterial;
    private monkeyMaterial2: Materials.BlinnPhongMaterial;
    private monkeyMaterial3: Materials.BlinnPhongMaterial;
    private monkeyRenderer1: Entities.MeshRenderer;
    private monkeyRenderer2: Entities.MeshRenderer;
    private monkeyRenderer3: Entities.MeshRenderer;
    private monkeyMesh: Meshes.MDLMesh;

    private lightMesh: Meshes.SphereMesh;

    private customLights: CustomLight[];

    private cameraAngles: vec3;

    constructor(game: Game) {
        super(game);

        this.gridMaterial = new Materials.VertexColoredMaterial(this);
        this.gridMesh = new Meshes.GridMesh(this, 10, 10, vec4.fromValues(0.45, 0.3, 0.15, 1));
        this.gridRenderer = new Entities.MeshRenderer(this, "Grid");
        this.gridRenderer.SetMesh(this.gridMesh);
        this.gridRenderer.SetMaterial(this.gridMaterial);

        this.monkeyMaterial1 = new Materials.BlinnPhongMaterial(this);
        this.monkeyMaterial1.Color = vec3.fromValues(1, 1, 1);
        this.monkeyMaterial1.MainTexture = Texture2D.Get(this, "./Tiles-Diff.png");
        this.monkeyMaterial1.GlossTexture = Texture2D.Get(this, "./Tiles-Gloss.png");

        this.monkeyMaterial2 = new Materials.BlinnPhongMaterial(this);
        this.monkeyMaterial2.Color = vec3.fromValues(0, 1, 0);
        this.monkeyMaterial2.MainTexture = Texture2D.Get(this, "./Tiles-Diff.png");
        this.monkeyMaterial2.GlossTexture = Texture2D.Get(this, "./Tiles-Gloss.png");

        this.monkeyMaterial3 = new Materials.BlinnPhongMaterial(this);
        this.monkeyMaterial3.Color = vec3.fromValues(1, 0, 0);
        this.monkeyMaterial3.MainTexture = Texture2D.Get(this, "./Tiles-Diff.png");
        this.monkeyMaterial3.GlossTexture = Texture2D.Get(this, "./Tiles-Gloss.png");

        this.monkeyRenderer1 = new Entities.MeshRenderer(this, "Monkey 1");
        this.monkeyRenderer2 = new Entities.MeshRenderer(this, "Monkey 2");
        this.monkeyRenderer3 = new Entities.MeshRenderer(this, "Monkey 3");
        this.monkeyRenderer1.SetMaterial(this.monkeyMaterial1);
        this.monkeyRenderer2.SetMaterial(this.monkeyMaterial2);
        this.monkeyRenderer3.SetMaterial(this.monkeyMaterial3);
        this.monkeyMesh = new Meshes.MDLMesh(this, "./Monkey.mdl", () => {
            this.monkeyRenderer1.SetMesh(this.monkeyMesh);
            this.monkeyRenderer2.SetMesh(this.monkeyMesh);
            this.monkeyRenderer3.SetMesh(this.monkeyMesh);
        });

        this.lightMesh = new Meshes.SphereMesh(this, 12, 6);

        this.customLights = [
            new CustomLight(this, this.lightMesh, vec3.fromValues(3, 3, 4), vec3.fromValues(1, 0.8, 0.4), 4),
            new CustomLight(this, this.lightMesh, vec3.fromValues(-3, 2, -2), vec3.fromValues(0.2, 0.6, 1), 5),
            new CustomLight(this, this.lightMesh, vec3.fromValues(-1, 0, 8), vec3.fromValues(0.6, 1, 0.2), 4),
            new CustomLight(this, this.lightMesh, vec3.fromValues(1, 4, -2), vec3.fromValues(1, 0.2, 0.4), 4)
        ];

        this.cameraAngles = vec3.fromValues(-20, 0, 0);
    }

    public Start(): void {
        super.Start();

        this.ClearColor = vec4.fromValues(0.15, 0.1, 0.05, 1);
        this.AmbientLight = vec3.fromValues(0.15, 0.1, 0.05);

        this.AddEntity(this.gridRenderer);

        this.monkeyRenderer1.Transform.Position = vec3.fromValues(0, 0, 0);
        this.monkeyRenderer2.Transform.Position = vec3.fromValues(-5, 0, 0);
        this.monkeyRenderer3.Transform.Position = vec3.fromValues(5, 0, 0);

        this.monkeyRenderer1.Transform.Scale = vec3.fromValues(2, 2, 2);
        this.monkeyRenderer2.Transform.Scale = vec3.fromValues(1, 1, 1);
        this.monkeyRenderer3.Transform.Scale = vec3.fromValues(1, 1, 1);

        this.AddEntity(this.monkeyRenderer1);
        this.AddEntity(this.monkeyRenderer2);
        this.AddEntity(this.monkeyRenderer3);

        this.Camera.Transform.Position = vec3.fromValues(0, 4.5, 15);

        let cameraRotation: quat = quat.create();
        this.Camera.Transform.Rotation = quat.fromEuler(cameraRotation, this.cameraAngles[0], this.cameraAngles[1], this.cameraAngles[2]);
    }

    public Update(deltaTime: number): void {
        super.Update(deltaTime);

        this.ProcessInput(deltaTime);

        let currentTime = this.Game.ElapsedSeconds;
        //let speed = currentTime * 0.25 * Math.PI;

        // this.Camera.Transform.Position = vec3.fromValues(Math.sin(speed) * 15, 4.5, Math.cos(speed) * 15);

        // let cameraRotation: quat = quat.create();
        // this.Camera.Transform.Rotation = quat.fromEuler(cameraRotation, -20, currentTime * 0.25 * 180, 0);

        let monkey2Rotation: quat = quat.create();
        this.monkeyRenderer2.Transform.Rotation = quat.fromEuler(monkey2Rotation, 0, currentTime * 180, 0);

        let monkey3Rotation: quat = quat.create();
        this.monkeyRenderer3.Transform.Rotation = quat.fromEuler(monkey3Rotation, 0, -currentTime * 180, 0);
    }

    public Dispose(): void {
        this.gridRenderer.Dispose();
        this.gridMesh.Dispose();

        this.monkeyRenderer1.Dispose();
        this.monkeyRenderer2.Dispose();
        this.monkeyRenderer3.Dispose();
        this.monkeyMesh.Dispose();

        this.lightMesh.Dispose();

        for (let l: number = 0; l < this.customLights.length; l++) this.customLights[l].Dispose();

        super.Dispose();
    }

    private ProcessInput(deltaTime: number): void {
        const input: InputSystem.InputSystem = this.Game.InputSystem;

        // Keyboard movement

        const direction: vec3 = vec3.create();

        if (input.GetKey(Keys.KEY_W)) direction[2] = 1;
        else if (input.GetKey(Keys.KEY_S)) direction[2] = -1;

        if (input.GetKey(Keys.KEY_A)) direction[0] = -1;
        else if (input.GetKey(Keys.KEY_D)) direction[0] = 1;

        if (input.GetKey(Keys.KEY_Q)) direction[1] = -1;
        else if (input.GetKey(Keys.KEY_E)) direction[1] = 1;

        const offset: vec3 = vec3.create();
        const temp: vec3 = vec3.create();

        vec3.add(offset, offset, vec3.scale(temp, this.Camera.Transform.Right, direction[0]));
        vec3.add(offset, offset, vec3.scale(temp, this.Camera.Transform.Forward, direction[2]));
        offset[1] += direction[1];
        vec3.normalize(offset, offset);

        let finalSpeed: number;
        if (input.GetKey(Keys.KEY_SHIFT_LEFT) || input.GetKey(Keys.KEY_SHIFT_RIGHT))
            finalSpeed = MOVEMENT_SPEED * 3;
        else
            finalSpeed = MOVEMENT_SPEED;

        vec3.scale(temp, offset, finalSpeed * deltaTime);
        this.Camera.Transform.Move(temp);

        // Mouse rotation

        if (input.GetMouseButton(Keys.MOUSE_BUTTON_MAIN)) {

            const delta: vec2 = input.MouseDeltaMovement;

            this.cameraAngles[0] -= delta[1] * MOUSE_SENSITIVITY;
            this.cameraAngles[1] -= delta[0] * MOUSE_SENSITIVITY;
            this.cameraAngles[2] = 0;

            this.Camera.Transform.SetEulerAngles(this.cameraAngles[0], this.cameraAngles[1], this.cameraAngles[2]);
        }
    }
}

class CustomLight implements IDisposable {

    private light: Entities.Light;
    private material: Materials.UnlitColoredMaterial;
    private renderer: Entities.MeshRenderer;

    constructor(scene: Scene, mesh: Meshes.Mesh, position: vec3, color: vec3, intensity: number) {

        this.light = new Entities.Light(scene, "Light");
        this.material = new Materials.UnlitColoredMaterial(scene);
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
        this.renderer.Dispose();
    }
}