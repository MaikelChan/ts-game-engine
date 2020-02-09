import { Material } from "./Material";
import { UniformTypes } from "./Shader";
import { IGlobalUniforms } from "../Interfaces";
import { Scene } from "..";
import { POSITION_ATTRIBUTE_LOCATION, POSITION_ATTRIBUTE, VIEW_DIRECTION_PROJECTION_INVERSE_MATRIX_UNIFORM } from "../Constants";
import { TextureCube } from "../Textures/TextureCube";
import { TextureTypes } from "../Textures/Texture";

export class SkyboxMaterial extends Material {

    private skyboxTexture: TextureCube;
    get SkyboxTexture(): TextureCube { return this.skyboxTexture; }
    set SkyboxTexture(texture: TextureCube) { this.skyboxTexture = texture; }

    constructor(scene: Scene) {
        super(scene, vsSource, fsSource);

        this.Shader.DefineUniform(VIEW_DIRECTION_PROJECTION_INVERSE_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform("uSkybox", UniformTypes.SamplerCube);

        this.skyboxTexture = TextureCube.GetBlank(scene);
    }

    public SetUniforms(globalUniforms: IGlobalUniforms): void {
        this.Shader.SetMatrix4Uniform(VIEW_DIRECTION_PROJECTION_INVERSE_MATRIX_UNIFORM, globalUniforms.viewDirectionProjectionInverseMatrix);
        this.Shader.SetSamplerUniform("uSkybox", 0, this.skyboxTexture, TextureTypes.TextureCubeMap);
    }
}

const vsSource: string = `#version 300 es
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 ${POSITION_ATTRIBUTE};

out vec4 vPosition;

void main() {
    vec2 scaledPosition = ${POSITION_ATTRIBUTE}.xy * 2.0; // scale quad from -.5 +.5 range to -1 +1
    vPosition = vec4(scaledPosition, 1, 1);
    gl_Position = vPosition;
}`;

const fsSource: string = `#version 300 es
precision mediump float;

in vec4 vPosition;

uniform mat4 ${VIEW_DIRECTION_PROJECTION_INVERSE_MATRIX_UNIFORM};
uniform samplerCube uSkybox;

out vec4 fragColor;

void main() {
    vec4 t = ${VIEW_DIRECTION_PROJECTION_INVERSE_MATRIX_UNIFORM} * vPosition;
    fragColor = texture(uSkybox, normalize(t.xyz / t.w));
}`;