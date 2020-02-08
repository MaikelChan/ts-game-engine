import { IDisposable, IUniformData } from "../Interfaces";
import { mat4, vec3, mat3, vec2 } from "gl-matrix";
import { Texture2D } from "../Systems/Graphics/Texture2D";
import { TEXTURE_UNIT_AMOUNT, PipelineState } from "../Systems/Graphics/PipelineState";
import { Scene } from "../Scene";

export const enum UniformTypes { Int1, Float1, Float1Vector, Float2, Float2Vector, Float3, Float3Vector, Float4, Float4Vector, Matrix3, Matrix4, Sampler2D }

export class Shader implements IDisposable {

    private context: WebGL2RenderingContext;
    private pipelineState: PipelineState;

    private program: WebGLProgram;
    get Program(): WebGLProgram { return this.program; }

    private instancedAttributes: Map<string, number> = new Map<string, number>();
    get InstancedAttributes(): Map<string, number> { return this.instancedAttributes };

    private uniforms: Map<string, IUniformData> = new Map<string, IUniformData>();
    get Uniforms(): Map<string, IUniformData> { return this.uniforms };

    private constructor(scene: Scene, vsSource: string, fsSource: string) {
        this.context = scene.Game.GraphicsSystem.Context;
        this.pipelineState = scene.Game.GraphicsSystem.PipelineState;

        const vertexShader: WebGLShader | null = this.CreateShader(WebGL2RenderingContext.VERTEX_SHADER, vsSource);
        if (vertexShader === null) {
            throw new Error();
        }

        const fragmentShader: WebGLShader | null = this.CreateShader(WebGL2RenderingContext.FRAGMENT_SHADER, fsSource);
        if (fragmentShader === null) {
            this.context.deleteShader(vertexShader);
            throw new Error();
        }

        const shaderProgram: WebGLProgram | null = this.CreateShaderProgram(vertexShader, fragmentShader);
        if (shaderProgram === null) {
            throw new Error();
        }

        this.program = shaderProgram;
    }

    public Dispose(): void {
        this.context.deleteProgram(this.program);
    }

    // Attributes and Uniforms ------------------------------------------------------------------------------------------------

    public DefineInstancedAttribute(name: string, location: number): void {
        if (location < 0) {
            console.error("Instanced attribute location not valid");
            return;
        }

        this.instancedAttributes.set(name, location);
    }

    public DefineUniform(name: string, type: UniformTypes): void {
        const location: WebGLUniformLocation | null = this.context.getUniformLocation(this.program, name);
        if (location === null) {
            console.warn("Uniform not found: " + name);
            return;
        }
        this.uniforms.set(name, { location: location, type: type, value: undefined });
    }

    // Uniforms are stored in shader program, so cache them in Shader to avoid unnecessary GL calls.
    // The following SetUniform functions must always be called after glUseProgram.

    public SetInt1Uniform(uniformName: string, value: number) {
        let uniformData: IUniformData | undefined = this.Uniforms.get(uniformName);
        if (uniformData === undefined) return;

        if (uniformData.value !== undefined && uniformData.value === value) return;
        uniformData.value = value;

        this.context.uniform1i(uniformData.location, value);
    }

    public SetFloat2Uniform(uniformName: string, value: vec2) {
        let uniformData: IUniformData | undefined = this.Uniforms.get(uniformName);
        if (uniformData === undefined) return;

        if (uniformData.value !== undefined) {
            if (vec2.exactEquals(uniformData.value, value)) return;
        }
        else {
            uniformData.value = vec2.create();
        }

        vec2.copy(uniformData.value, value);
        this.context.uniform2f(uniformData.location, value[0], value[1]);
    }

    public SetFloat3Uniform(uniformName: string, value: vec3) {
        let uniformData: IUniformData | undefined = this.Uniforms.get(uniformName);
        if (uniformData === undefined) return;

        if (uniformData.value !== undefined) {
            if (vec3.exactEquals(uniformData.value, value)) return;
        }
        else {
            uniformData.value = vec3.create();
        }

        vec3.copy(uniformData.value, value);
        this.context.uniform3f(uniformData.location, value[0], value[1], value[2]);
    }

    public SetFloat4VectorUniform(uniformName: string, value: Float32Array) {
        let uniformData: IUniformData | undefined = this.Uniforms.get(uniformName);
        if (uniformData === undefined) return;

        if (uniformData.value !== undefined) {
            let equals: boolean = true;
            for (let v: number = 0; v < value.length; v++) {
                if (uniformData.value[v] !== value[v]) { equals = false; break; }
            }

            if (equals) return;
        }
        else {
            uniformData.value = new Float32Array(value.length);
        }

        for (let v: number = 0; v < value.length; v++) uniformData.value[v] = value[v];
        this.context.uniform4fv(uniformData.location, value);
    }

    public SetMatrix3Uniform(uniformName: string, value: mat3) {
        let uniformData: IUniformData | undefined = this.Uniforms.get(uniformName);
        if (uniformData === undefined) return;

        if (uniformData.value !== undefined) {
            if (mat3.exactEquals(uniformData.value, value)) return;
        }
        else {
            uniformData.value = mat3.create();
        }

        mat3.copy(uniformData.value, value);
        this.context.uniformMatrix3fv(uniformData.location, false, value);
    }

    public SetMatrix4Uniform(uniformName: string, value: mat4) {
        let uniformData: IUniformData | undefined = this.Uniforms.get(uniformName);
        if (uniformData === undefined) return;

        if (uniformData.value !== undefined) {
            if (mat4.exactEquals(uniformData.value, value)) return;
        }
        else {
            uniformData.value = mat4.create();
        }

        mat4.copy(uniformData.value, value);
        this.context.uniformMatrix4fv(uniformData.location, false, value);
    }

    public SetSampler2DUniform(uniformName: string, textureUnit: number, texture: Texture2D) {
        if (textureUnit < 0 || textureUnit >= TEXTURE_UNIT_AMOUNT) {
            console.error("Invalid texture unit value: " + textureUnit);
            return;
        }

        let uniformData: IUniformData | undefined = this.Uniforms.get(uniformName);
        if (uniformData === undefined) return;

        if (uniformData.value === undefined || uniformData.value !== textureUnit) {
            uniformData.value = textureUnit;
            this.context.uniform1i(uniformData.location, textureUnit);
        }

        this.pipelineState.BindTexture(texture, textureUnit);
    }

    // Shader creation --------------------------------------------------------------------------------------------------------

    private CreateShader(type: number, source: string): WebGLShader | null {
        const shader: WebGLShader | null = this.context.createShader(type);

        if (shader === null) {
            console.error(`Unable to create ${type === WebGL2RenderingContext.VERTEX_SHADER ? "vertex" : "fragment"} shader.`);
            return null;
        }

        this.context.shaderSource(shader, source);
        this.context.compileShader(shader);

        if (!this.context.getShaderParameter(shader, WebGL2RenderingContext.COMPILE_STATUS)) {
            console.error(`Error compiling the ${type === WebGL2RenderingContext.VERTEX_SHADER ? "vertex" : "fragment"} shader: ${this.context.getShaderInfoLog(shader)}`);
            this.context.deleteShader(shader);
            return null;
        }

        return shader;
    }

    private CreateShaderProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
        const shaderProgram: WebGLProgram | null = this.context.createProgram();

        if (shaderProgram === null) {
            this.context.deleteShader(vertexShader);
            this.context.deleteShader(fragmentShader);
            console.error("Unable to create shader program.");
            return null;
        }

        this.context.attachShader(shaderProgram, vertexShader);
        this.context.attachShader(shaderProgram, fragmentShader);

        this.context.linkProgram(shaderProgram);

        this.context.detachShader(shaderProgram, vertexShader);
        this.context.detachShader(shaderProgram, fragmentShader);
        this.context.deleteShader(vertexShader);
        this.context.deleteShader(fragmentShader);

        if (!this.context.getProgramParameter(shaderProgram, WebGL2RenderingContext.LINK_STATUS)) {
            console.error("Unable to link shader program: " + this.context.getProgramInfoLog(shaderProgram));
            this.context.deleteProgram(shaderProgram);
            return null;
        }

        return shaderProgram;
    }

    // Shader Manager ---------------------------------------------------------------------------------------------------------

    private static readonly shaders: Map<string, Shader> = new Map<string, Shader>();

    public static Get(scene: Scene, name: string, vsSource: string, psSource: string): Shader {
        let key: string = name;

        let shader: Shader | undefined = this.shaders.get(key);

        if (shader === undefined) {
            shader = new Shader(scene, vsSource, psSource);
            this.shaders.set(key, shader);
        }

        return shader;
    }

    public static DisposeAll(): void {
        for (let shader of this.shaders.values()) {
            shader.Dispose();
        }

        this.shaders.clear();
    }
}