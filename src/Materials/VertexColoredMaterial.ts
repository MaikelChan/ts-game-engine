import { Material } from "./Material";
import { POSITION_ATTRIBUTE, COLOR_ATTRIBUTE, MODEL_MATRIX_UNIFORM, VIEW_MATRIX_UNIFORM, PROJECTION_MATRIX_UNIFORM, UniformTypes } from "./Shader";
import { IGlobalUniforms } from "../Interfaces";
import { Scene } from "..";

export class VertexColoredMaterial extends Material {

    constructor(scene: Scene) {
        super(scene, vsSource, fsSource);

        this.Shader.DefineAttribute(POSITION_ATTRIBUTE);
        this.Shader.DefineAttribute(COLOR_ATTRIBUTE);

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

const vsSource: string = `
attribute vec3 ${POSITION_ATTRIBUTE};
attribute vec4 ${COLOR_ATTRIBUTE};

uniform mat4 ${MODEL_MATRIX_UNIFORM};
uniform mat4 ${VIEW_MATRIX_UNIFORM};
uniform mat4 ${PROJECTION_MATRIX_UNIFORM};

varying vec4 vColor;

void main() {
    gl_Position = ${PROJECTION_MATRIX_UNIFORM} * ${VIEW_MATRIX_UNIFORM} * ${MODEL_MATRIX_UNIFORM} * vec4(${POSITION_ATTRIBUTE}, 1);
    vColor = ${COLOR_ATTRIBUTE};
}`;

const fsSource: string = `
precision mediump float;

varying vec4 vColor;    

void main() {
    gl_FragColor = vColor;
}`;