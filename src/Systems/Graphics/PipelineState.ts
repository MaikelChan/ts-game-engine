import { vec4 } from "gl-matrix";
import { Shader } from "../../Materials/Shader";
import { Texture, TextureTypes } from "../../Textures/Texture";

export const enum FaceCullingModes { Front = 0x0404, Back = 0x0405, FrontAndBack = 0x0408 }
export const enum DepthFunctions { Never = 0x0200, Less = 0x0201, Equal = 0x0202, LEqual = 0x0203, Greater = 0x0204, NotEqual = 0x0205, GEqual = 0x0206, Always = 0x0207 }

export const TEXTURE_UNIT_AMOUNT: number = 16;

export class PipelineState {
    private context: WebGL2RenderingContext;

    constructor(context: WebGL2RenderingContext) {
        this.context = context;
    }

    private clearColor: vec4 = vec4.fromValues(0, 0, 0, 0);
    get ClearColor(): vec4 { return this.clearColor; }
    set ClearColor(clearColor: vec4) {
        if (vec4.exactEquals(this.clearColor, clearColor)) return;
        this.clearColor = clearColor;
        this.context.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    }

    private clearDepth: number = 1;
    get ClearDepth(): number { return this.clearDepth; }
    set ClearDepth(clearDepth: number) {
        if (this.clearDepth === clearDepth) return;
        this.clearDepth = clearDepth;
        this.context.clearDepth(clearDepth);
    }

    private depthTest: boolean = false;
    get DepthTest(): boolean { return this.depthTest; }
    set DepthTest(depthTest: boolean) {
        if (this.depthTest === depthTest) return;
        this.depthTest = depthTest;
        if (depthTest) this.context.enable(this.context.DEPTH_TEST);
        else this.context.disable(this.context.DEPTH_TEST);
    }

    private depthFunction: DepthFunctions = DepthFunctions.Less;
    get DepthFunction(): DepthFunctions { return this.depthFunction; }
    set DepthFunction(depthFunction: DepthFunctions) {
        if (this.depthFunction === depthFunction) return;
        this.depthFunction = depthFunction;
        this.context.depthFunc(depthFunction);
    }

    private faceCulling: boolean = false;
    get FaceCulling(): boolean { return this.faceCulling; }
    set FaceCulling(faceCulling: boolean) {
        if (this.faceCulling === faceCulling) return;
        this.faceCulling = faceCulling;
        if (faceCulling) this.context.enable(this.context.CULL_FACE);
        else this.context.disable(this.context.CULL_FACE);
    }

    private faceCullingMode: FaceCullingModes = FaceCullingModes.Back;
    get FaceCullingMode(): FaceCullingModes { return this.faceCullingMode; }
    set FaceCullingMode(faceCullingMode: FaceCullingModes) {
        if (this.faceCullingMode === faceCullingMode) return;
        this.faceCullingMode = faceCullingMode;
        this.context.cullFace(faceCullingMode);
    }

    private currentShader: Shader | undefined;
    get CurrentShader(): Shader | undefined { return this.currentShader; }
    set CurrentShader(shader: Shader | undefined) {
        if (this.currentShader === shader) return;
        this.currentShader = shader;
        if (shader) this.context.useProgram(shader.Program);
        else this.context.useProgram(null);
    }

    private currentVAO: WebGLVertexArrayObject | null = null;
    get CurrentVAO(): WebGLVertexArrayObject | null { return this.currentVAO; }
    set CurrentVAO(vao: WebGLVertexArrayObject | null) {
        if (this.currentVAO === vao) return;
        this.currentVAO = vao;
        this.context.bindVertexArray(vao);
    }

    private currentTextureUnit: number = 0;
    private SetCurrentTextureUnit(textureUnit: number) {
        if (this.currentTextureUnit === textureUnit) return;
        this.currentTextureUnit = textureUnit;
        this.context.activeTexture(WebGL2RenderingContext.TEXTURE0 + textureUnit);
    }

    private textureUnits: Texture[] = new Array(TEXTURE_UNIT_AMOUNT);
    public BindTexture(type: TextureTypes, texture: Texture, textureUnit: number): void {
        if (this.textureUnits[textureUnit] === texture) return;
        this.textureUnits[textureUnit] = texture;

        this.SetCurrentTextureUnit(textureUnit);

        this.context.bindTexture(type, texture.Texture);
    }
}