import { Shader } from "./Shader";
import { IGlobalUniforms } from "../Interfaces";

export abstract class Material {

    protected readonly context: WebGLRenderingContext;

    private shader: Shader;
    get Shader(): Shader { return this.shader; }

    constructor(context: WebGLRenderingContext, vsSource: string, fsSource: string) {
        this.context = context;

        this.shader = Shader.GetShader(this.context, this.constructor.name, vsSource, fsSource);
    }

    public abstract SetUniforms(globalUniforms: IGlobalUniforms): void;
}