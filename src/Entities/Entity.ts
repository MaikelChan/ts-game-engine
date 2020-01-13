import { Transform } from "../Components";
import { Scene } from "../Scene";
import { IDisposable } from "../Interfaces";

export abstract class Entity implements IDisposable {

    private scene: Scene;
    get Scene(): Scene { return this.scene; }

    private name: string;
    get Name(): string { return this.name; }

    private transform: Transform;
    get Transform(): Transform { return this.transform; }

    constructor(scene: Scene, name: string) {
        this.scene = scene;
        this.name = name;

        this.transform = new Transform();
    }

    Dispose(): void {

    }
}