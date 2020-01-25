import { Scene } from "./Scene";
import { IDisposable } from "./Interfaces";
import { GraphicsSystem } from "./Systems/Graphics/GraphicsSystem";
import { Shader } from "./Materials";
import { Texture2D } from ".";
import { Settings } from "./Settings";

export abstract class Game implements IDisposable {
    private graphicsSystem: GraphicsSystem;
    get GraphicsSystem(): GraphicsSystem { return this.graphicsSystem; }

    private settings: Settings;
    get Settings(): Settings { return this.settings; }

    private scene: Scene | undefined;
    get Scene(): Scene | undefined { return this.scene; }

    private shouldUpdate: boolean;
    private initialTime: number;
    private previousFrameElapsedMilliseconds: number;

    private elapsedSeconds: number;
    get ElapsedSeconds(): number { return this.elapsedSeconds; }

    constructor(canvas: HTMLCanvasElement) {
        this.graphicsSystem = new GraphicsSystem(canvas);
        this.settings = new Settings();

        this.shouldUpdate = false;
        this.initialTime = -1;
        this.previousFrameElapsedMilliseconds = 0;
        this.elapsedSeconds = 0;
    }

    public Update = (now: number): void => {
        if (!this.shouldUpdate) return;
        if (this.scene === undefined) return;

        let context: WebGLRenderingContext = this.graphicsSystem.Context;

        if (this.initialTime < 0) this.initialTime = now;
        let elapsedMilliseconds = now - this.initialTime;
        let deltaTime = (elapsedMilliseconds - this.previousFrameElapsedMilliseconds) / 1000;
        this.previousFrameElapsedMilliseconds = elapsedMilliseconds;
        this.elapsedSeconds = elapsedMilliseconds / 1000;

        this.scene.Update(deltaTime);

        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        this.scene.Render();

        requestAnimationFrame(this.Update);
    }

    public LoadScene(scene: Scene): void {
        this.scene = scene;
        this.scene.Start();
        this.StartUpdating();
    }

    public Dispose(): void {
        this.shouldUpdate = false;

        Shader.DisposeAll();
        Texture2D.DisposeAll();
        this.graphicsSystem.Dispose();
    }

    public Resize(width: number, height: number): void {
        this.graphicsSystem.Resize(width, height);
        this.scene?.Resize(width, height);
    }

    private StartUpdating() {
        if (this.shouldUpdate) return;
        this.shouldUpdate = true;
        requestAnimationFrame(this.Update);
    }
}