import { Entity } from "./Entity";
import { Scene } from "../Scene";
import { vec3 } from "gl-matrix";

export class Light extends Entity {

    private color: vec3;
    get Color(): vec3 { return this.color; }
    set Color(color: vec3) { this.color = color; }

    private intensity: number;
    get Intensity(): number { return this.intensity; }
    set Intensity(intensity: number) { this.intensity = intensity; }

    constructor(scene: Scene, name: string) {
        super(scene, name);

        this.color = vec3.fromValues(1, 1, 1);
        this.intensity = 1;
    }
}