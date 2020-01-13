import { Entity } from "./Entity";
import { mat4, vec3, glMatrix } from "gl-matrix";
import { Scene } from "../Scene";

export class Camera extends Entity {

    private fov: number;
    get FOV(): number { return this.fov; }
    set FOV(fov: number) { if (this.fov === fov) return; this.fov = fov; this.UpdateProjectionMatrix(); }

    private near: number;
    get Near(): number { return this.near; }
    set Near(near: number) { if (this.near === near) return; this.near = near; this.UpdateProjectionMatrix(); }

    private far: number;
    get Far(): number { return this.far; }
    set Far(far: number) { if (this.far === far) return; this.far = far; this.UpdateProjectionMatrix(); }

    private viewMatrix: mat4;
    get ViewMatrix(): mat4 { return this.viewMatrix; }

    private projectionMatrix: mat4;
    get ProjectionMatrix(): mat4 { return this.projectionMatrix; }

    constructor(scene: Scene, name: string) {
        super(scene, name);

        this.fov = 45;
        this.near = 0.1;
        this.far = 1000;

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();

        this.UpdateViewMatrix();
        this.UpdateProjectionMatrix();

        this.Transform.OnTransformChange = () => this.UpdateViewMatrix();
    }

    public Resize(width: number, height: number): void {
        this.UpdateProjectionMatrix();
    }

    private UpdateViewMatrix(): void {
        let position: vec3 = this.Transform.Position;
        let target: vec3 = vec3.create();
        vec3.add(target, position, this.Transform.Forward);
        mat4.lookAt(this.viewMatrix, position, target, this.Transform.Up);
    }

    private UpdateProjectionMatrix(): void {
        mat4.perspective(this.projectionMatrix, glMatrix.toRadian(this.fov), this.Scene.Game.GraphicsSystem.AspectRatio, this.near, this.far);
    }
}