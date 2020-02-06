import { Material } from "./Material";
import { POSITION_ATTRIBUTE, MODEL_MATRIX_UNIFORM, VIEW_MATRIX_UNIFORM, PROJECTION_MATRIX_UNIFORM, UniformTypes } from "./Shader";
import { vec3 } from "gl-matrix";
import { IGlobalUniforms } from "../Interfaces";
import { Scene } from "..";

export class UnlitColoredMaterial extends Material {

    private color: vec3;
    get Color(): vec3 { return this.color; }
    set Color(color: vec3) { this.color = color; }

    constructor(scene: Scene) {
        super(scene, vsSource, fsSource);

        this.Shader.DefineAttribute(POSITION_ATTRIBUTE);

        this.Shader.DefineUniform(MODEL_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(VIEW_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(PROJECTION_MATRIX_UNIFORM, UniformTypes.Matrix4);

        this.Shader.DefineUniform("uColor", UniformTypes.Float3);

        this.color = vec3.fromValues(1, 1, 1);
    }

    public SetUniforms(globalUniforms: IGlobalUniforms): void {
        this.Shader.SetMatrix4Uniform(MODEL_MATRIX_UNIFORM, globalUniforms.modelMatrix);
        this.Shader.SetMatrix4Uniform(VIEW_MATRIX_UNIFORM, globalUniforms.viewMatrix);
        this.Shader.SetMatrix4Uniform(PROJECTION_MATRIX_UNIFORM, globalUniforms.projectionMatrix);

        this.Shader.SetFloat3Uniform("uColor", this.color);
    }
}

const vsSource: string = `#version 300 es
in vec3 ${POSITION_ATTRIBUTE};

uniform mat4 ${MODEL_MATRIX_UNIFORM};
uniform mat4 ${VIEW_MATRIX_UNIFORM};
uniform mat4 ${PROJECTION_MATRIX_UNIFORM};

void main() {
    gl_Position = ${PROJECTION_MATRIX_UNIFORM} * ${VIEW_MATRIX_UNIFORM} * ${MODEL_MATRIX_UNIFORM} * vec4(${POSITION_ATTRIBUTE}, 1);
}`;

const fsSource: string = `#version 300 es
precision mediump float;

uniform vec3 uColor;

out vec4 fragColor;

void main() {
    fragColor = vec4(uColor, 1);
}`;