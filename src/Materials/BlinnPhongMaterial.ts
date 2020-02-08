import { Material } from "./Material";
import { UniformTypes } from "./Shader";
import { vec3, vec2 } from "gl-matrix";
import { IGlobalUniforms } from "../Interfaces";
import { MAX_LIGHTS, LIGHT_DATA_SIZE, POSITION_ATTRIBUTE_LOCATION, COLOR_ATTRIBUTE_LOCATION, NORMAL_ATTRIBUTE_LOCATION, UV0_ATTRIBUTE_LOCATION, POSITION_ATTRIBUTE, COLOR_ATTRIBUTE, NORMAL_ATTRIBUTE, UV0_ATTRIBUTE, MODEL_MATRIX_UNIFORM, VIEW_MATRIX_UNIFORM, PROJECTION_MATRIX_UNIFORM, NORMAL_MATRIX_UNIFORM, VIEW_POSITION_UNIFORM, AMBIENT_LIGHT_UNIFORM, POINT_LIGHTS_DATA_UNIFORM, POINT_LIGHTS_COUNT_UNIFORM } from "../Constants";
import { Texture2D } from "../Systems/Graphics/Texture2D";
import { Scene } from "..";

export class BlinnPhongMaterial extends Material {

    private color: vec3;
    get Color(): vec3 { return this.color; }
    set Color(color: vec3) { this.color = color; }

    private specularPower: vec2;
    get Specular(): number { return this.specularPower[0]; }
    set Specular(specular: number) { this.specularPower[0] = specular; }
    get SpecularPower(): number { return this.specularPower[1]; }
    set SpecularPower(power: number) { this.specularPower[1] = power; }

    private mainTexture: Texture2D;
    get MainTexture(): Texture2D { return this.mainTexture; }
    set MainTexture(texture2D: Texture2D) { this.mainTexture = texture2D; }

    private glossTexture: Texture2D;
    get GlossTexture(): Texture2D { return this.glossTexture; }
    set GlossTexture(texture2D: Texture2D) { this.glossTexture = texture2D; }

    constructor(scene: Scene) {
        super(scene, vsSource, fsSource);

        this.Shader.DefineUniform(MODEL_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(VIEW_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(PROJECTION_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(NORMAL_MATRIX_UNIFORM, UniformTypes.Matrix3);

        this.Shader.DefineUniform(VIEW_POSITION_UNIFORM, UniformTypes.Float3);
        this.Shader.DefineUniform(AMBIENT_LIGHT_UNIFORM, UniformTypes.Float3);
        this.Shader.DefineUniform(POINT_LIGHTS_DATA_UNIFORM, UniformTypes.Float4Vector);
        this.Shader.DefineUniform(POINT_LIGHTS_COUNT_UNIFORM, UniformTypes.Int1);

        this.Shader.DefineUniform("uColor", UniformTypes.Float3);
        this.Shader.DefineUniform("uMainTexture", UniformTypes.Sampler2D);
        this.Shader.DefineUniform("uSpecularPower", UniformTypes.Float2);
        this.Shader.DefineUniform("uGlossTexture", UniformTypes.Sampler2D);

        this.color = vec3.fromValues(1, 1, 1);
        this.specularPower = vec2.fromValues(1, 32);
        this.mainTexture = Texture2D.GetBlank(scene);
        this.glossTexture = Texture2D.GetBlank(scene);
    }

    public SetUniforms(globalUniforms: IGlobalUniforms): void {
        this.Shader.SetMatrix4Uniform(MODEL_MATRIX_UNIFORM, globalUniforms.modelMatrix);
        this.Shader.SetMatrix4Uniform(VIEW_MATRIX_UNIFORM, globalUniforms.viewMatrix);
        this.Shader.SetMatrix4Uniform(PROJECTION_MATRIX_UNIFORM, globalUniforms.projectionMatrix);
        this.Shader.SetMatrix3Uniform(NORMAL_MATRIX_UNIFORM, globalUniforms.normalMatrix);

        this.Shader.SetFloat3Uniform(VIEW_POSITION_UNIFORM, globalUniforms.viewPosition);
        this.Shader.SetFloat3Uniform(AMBIENT_LIGHT_UNIFORM, globalUniforms.ambientLight);
        this.Shader.SetFloat4VectorUniform(POINT_LIGHTS_DATA_UNIFORM, globalUniforms.pointLightsData);
        this.Shader.SetInt1Uniform(POINT_LIGHTS_COUNT_UNIFORM, globalUniforms.pointLightsCount);

        this.Shader.SetFloat3Uniform("uColor", this.color);
        this.Shader.SetFloat2Uniform("uSpecularPower", this.specularPower);
        this.Shader.SetSampler2DUniform("uMainTexture", 0, this.mainTexture);
        this.Shader.SetSampler2DUniform("uGlossTexture", 1, this.glossTexture);
    }
}

const vsSource: string = `#version 300 es
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 ${POSITION_ATTRIBUTE};
layout(location = ${COLOR_ATTRIBUTE_LOCATION}) in vec4 ${COLOR_ATTRIBUTE};
layout(location = ${NORMAL_ATTRIBUTE_LOCATION}) in vec3 ${NORMAL_ATTRIBUTE};
layout(location = ${UV0_ATTRIBUTE_LOCATION}) in vec2 ${UV0_ATTRIBUTE};

uniform mat4 ${MODEL_MATRIX_UNIFORM};
uniform mat4 ${VIEW_MATRIX_UNIFORM};
uniform mat4 ${PROJECTION_MATRIX_UNIFORM};
uniform mat3 ${NORMAL_MATRIX_UNIFORM};

out vec4 vWorldPosition;
out vec3 vWorldNormal;
out vec4 vColor;
out vec2 vUV0;

void main() {
    vec4 worldPosition = ${MODEL_MATRIX_UNIFORM} * vec4(${POSITION_ATTRIBUTE}, 1);
    gl_Position = ${PROJECTION_MATRIX_UNIFORM} * ${VIEW_MATRIX_UNIFORM} * worldPosition;
    vWorldPosition = worldPosition;
    vWorldNormal = ${NORMAL_MATRIX_UNIFORM} * ${NORMAL_ATTRIBUTE};
    vColor = ${COLOR_ATTRIBUTE};
    vUV0 = ${UV0_ATTRIBUTE};
}`;

const fsSource: string = `#version 300 es
precision mediump float;

in vec4 vWorldPosition;
in vec3 vWorldNormal;
in vec4 vColor;
in vec2 vUV0;

uniform vec3 ${VIEW_POSITION_UNIFORM};
uniform vec3 ${AMBIENT_LIGHT_UNIFORM};
uniform vec4 ${POINT_LIGHTS_DATA_UNIFORM}[${MAX_LIGHTS} * ${LIGHT_DATA_SIZE}];
uniform int ${POINT_LIGHTS_COUNT_UNIFORM};

uniform vec3 uColor;
uniform sampler2D uMainTexture;
uniform vec2 uSpecularPower;
uniform sampler2D uGlossTexture;

out vec4 fragColor;

#define POINT_LIGHT_CONSTANT 1.0
#define POINT_LIGHT_LINEAR 0.22
#define POINT_LIGHT_QUADRATIC 0.20
 
vec3 CalcPointLight(vec3 lightPosition, float lightIntensity, vec3 lightColor, vec3 diffuse, float specularStrength, float specularPower, vec3 worldNormal, vec3 viewDir)
{
	float distance = length(lightPosition - vWorldPosition.xyz);	
	vec3 lightDir = normalize(lightPosition - vWorldPosition.xyz);
	vec3 halfwayDir = normalize(lightDir + viewDir);

	float attenuation = 1.0 / (POINT_LIGHT_CONSTANT + POINT_LIGHT_LINEAR * distance + POINT_LIGHT_QUADRATIC * (distance * distance));  

	vec3 light = diffuse * max(dot(worldNormal, lightDir), 0.0);
	light *= attenuation * lightIntensity;

	float specular = pow(max(dot(worldNormal, halfwayDir), 0.0), specularPower);
	specular *= specularStrength * attenuation * lightIntensity;

    return (light + vec3(specular, specular, specular)) * lightColor;
}

void main() {
    vec3 normalizedWorldNormal = normalize(vWorldNormal);
	vec3 viewDir = normalize(${VIEW_POSITION_UNIFORM} - vWorldPosition.xyz);

	vec3 diffuseColor = (texture(uMainTexture, vUV0).rgb * vColor.rgb * uColor).rgb;
	float specularTex = texture(uGlossTexture, vUV0).x;
	float specularStrength = mix(0.25, uSpecularPower.x, specularTex);
	float specularPower = mix(1.0, uSpecularPower.y, specularTex);

	vec3 lights = vec3(0, 0, 0);
	for(int i = 0; i < ${MAX_LIGHTS}; i++)
	{
        if(i >= ${POINT_LIGHTS_COUNT_UNIFORM}) break;
        
        vec4 lightPositionIntensity = ${POINT_LIGHTS_DATA_UNIFORM}[i * ${LIGHT_DATA_SIZE}];
		vec4 lightColor = ${POINT_LIGHTS_DATA_UNIFORM}[i * ${LIGHT_DATA_SIZE} + 1];
		lights += CalcPointLight(lightPositionIntensity.xyz, lightPositionIntensity.w, lightColor.rgb, diffuseColor, specularStrength, specularPower, normalizedWorldNormal, viewDir);
	}

	fragColor = vec4(lights + ${AMBIENT_LIGHT_UNIFORM} * diffuseColor, 1);
}`;