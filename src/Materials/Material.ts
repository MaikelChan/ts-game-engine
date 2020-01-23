import { Shader } from "./Shader";
import { IGlobalUniforms } from "../Interfaces";
import { Scene } from "..";

export abstract class Material {

    private shader: Shader;
    get Shader(): Shader { return this.shader; }

    constructor(scene: Scene, vsSource: string, fsSource: string) {
        this.shader = Shader.Get(scene, this.constructor.name, vsSource, fsSource);
    }

    public abstract SetUniforms(globalUniforms: IGlobalUniforms): void;
}