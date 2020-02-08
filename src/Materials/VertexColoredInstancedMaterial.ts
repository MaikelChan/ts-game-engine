import { Material } from "./Material";
import { UniformTypes } from "./Shader";
import { POSITION_ATTRIBUTE, COLOR_ATTRIBUTE, MODEL_MATRIX_UNIFORM, VIEW_MATRIX_UNIFORM, PROJECTION_MATRIX_UNIFORM, POSITION_ATTRIBUTE_LOCATION, COLOR_ATTRIBUTE_LOCATION, INSTANCED_ATTRIBUTE_BASE_LOCATION, INSTANCE_MATRIX_ATTRIBUTE } from "../Constants";
import { IGlobalUniforms } from "../Interfaces";
import { Scene } from "..";

export class VertexColoredInstancedMaterial extends Material {

    constructor(scene: Scene) {
        super(scene, vsSource, fsSource);

        this.Shader.DefineInstancedAttribute(INSTANCE_MATRIX_ATTRIBUTE, INSTANCED_ATTRIBUTE_BASE_LOCATION + 0);

        this.Shader.DefineUniform(MODEL_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(VIEW_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(PROJECTION_MATRIX_UNIFORM, UniformTypes.Matrix4);
    }

    public SetUniforms(globalUniforms: IGlobalUniforms): void {
        this.Shader.SetMatrix4Uniform(MODEL_MATRIX_UNIFORM, globalUniforms.modelMatrix);
        this.Shader.SetMatrix4Uniform(VIEW_MATRIX_UNIFORM, globalUniforms.viewMatrix);
        this.Shader.SetMatrix4Uniform(PROJECTION_MATRIX_UNIFORM, globalUniforms.projectionMatrix);
    }
}

const vsSource: string = `#version 300 es
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 ${POSITION_ATTRIBUTE};
layout(location = ${COLOR_ATTRIBUTE_LOCATION}) in vec4 ${COLOR_ATTRIBUTE};

layout(location = ${INSTANCED_ATTRIBUTE_BASE_LOCATION + 0}) in mat4 ${INSTANCE_MATRIX_ATTRIBUTE};

uniform mat4 ${MODEL_MATRIX_UNIFORM};
uniform mat4 ${VIEW_MATRIX_UNIFORM};
uniform mat4 ${PROJECTION_MATRIX_UNIFORM};

out vec4 vColor;

void main() {
    gl_Position = ${PROJECTION_MATRIX_UNIFORM} * ${VIEW_MATRIX_UNIFORM} * ${MODEL_MATRIX_UNIFORM} * ${INSTANCE_MATRIX_ATTRIBUTE} * vec4(${POSITION_ATTRIBUTE}, 1);
    vColor = ${COLOR_ATTRIBUTE};
}`;

const fsSource: string = `#version 300 es
precision mediump float;

in vec4 vColor;

out vec4 fragColor;

void main() {
    fragColor = vColor;
}`;