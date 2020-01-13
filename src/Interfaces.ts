import { UniformTypes } from "./Materials";
import { VertexFormat } from "./Meshes";
import { mat4, mat3, vec3 } from "gl-matrix";

export interface IDisposable {
    Dispose(): void;
}

export interface IRenderable {
    Render(): void;
}

export interface IVertexData {
    position: Float32Array;
    color?: Float32Array;
    normal?: Float32Array;
    uv0?: Float32Array;
    uv1?: Float32Array;
}

export interface IUniformData {
    location: WebGLUniformLocation;
    type: UniformTypes;
    value: any;
}

export interface IAttributeTypeInfo {
    vertexFormat: VertexFormat;
    name: string;
    size: number;
}

export interface IGlobalUniforms {
    modelMatrix: mat4;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    normalMatrix: mat3;

    viewPosition: vec3;
    ambientLight: vec3;
    lightsData: Float32Array;
}

// export interface IUniformData { location: WebGLUniformLocation; }
// export interface IFloat1UniformData extends IUniformData { value?: number; }
// export interface IFloat2UniformData extends IUniformData { value?: vec2; }
// export interface IFloat3UniformData extends IUniformData { value?: vec3; }
// export interface IFloat4UniformData extends IUniformData { value?: vec4; }
// export interface IMatrix3UniformData extends IUniformData { value?: mat3; }
// export interface IMatrix4UniformData extends IUniformData { value?: mat4; }