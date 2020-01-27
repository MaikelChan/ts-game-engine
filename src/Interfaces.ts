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
    pointLightsData: Float32Array;
    pointLightsCount: number;
}