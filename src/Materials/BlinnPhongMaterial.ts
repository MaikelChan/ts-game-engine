import { Material } from "./Material";
import { POSITION_ATTRIBUTE, MODEL_MATRIX_UNIFORM, VIEW_MATRIX_UNIFORM, PROJECTION_MATRIX_UNIFORM, UniformTypes, COLOR_ATTRIBUTE, NORMAL_ATTRIBUTE, UV0_ATTRIBUTE, NORMAL_MATRIX_UNIFORM, VIEW_POSITION_UNIFORM, AMBIENT_LIGHT_UNIFORM, POINT_LIGHTS_DATA_UNIFORM } from "./Shader";
import { vec3, vec2 } from "gl-matrix";
import { IGlobalUniforms } from "../Interfaces";
import { MAX_LIGHTS, LIGHT_DATA_SIZE } from "../Constants";

export class BlinnPhongMaterial extends Material {

    private color: vec3;
    get Color(): vec3 { return this.color; }
    set Color(color: vec3) { this.color = color; }

    private specularPower: vec2;
    get Specular(): number { return this.specularPower[0]; }
    set Specular(specular: number) { this.specularPower[0] = specular; }
    get SpecularPower(): number { return this.specularPower[1]; }
    set SpecularPower(power: number) { this.specularPower[1] = power; }

    constructor(context: WebGLRenderingContext) {
        super(context, vsSource, fsSource);

        this.Shader.DefineAttribute(POSITION_ATTRIBUTE);
        this.Shader.DefineAttribute(COLOR_ATTRIBUTE);
        this.Shader.DefineAttribute(NORMAL_ATTRIBUTE);
        this.Shader.DefineAttribute(UV0_ATTRIBUTE);

        this.Shader.DefineUniform(MODEL_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(VIEW_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(PROJECTION_MATRIX_UNIFORM, UniformTypes.Matrix4);
        this.Shader.DefineUniform(NORMAL_MATRIX_UNIFORM, UniformTypes.Matrix3);

        this.Shader.DefineUniform(VIEW_POSITION_UNIFORM, UniformTypes.Float3);
        this.Shader.DefineUniform(AMBIENT_LIGHT_UNIFORM, UniformTypes.Float3);
        this.Shader.DefineUniform(POINT_LIGHTS_DATA_UNIFORM, UniformTypes.Float4Vector);

        this.Shader.DefineUniform("uColor", UniformTypes.Float3);
        this.Shader.DefineUniform("uSpecularPower", UniformTypes.Float2);

        this.color = vec3.fromValues(1, 1, 1);
        this.specularPower = vec2.fromValues(1, 32);
    }

    public SetUniforms(globalUniforms: IGlobalUniforms): void {
        this.Shader.SetMatrix4Uniform(MODEL_MATRIX_UNIFORM, globalUniforms.modelMatrix);
        this.Shader.SetMatrix4Uniform(VIEW_MATRIX_UNIFORM, globalUniforms.viewMatrix);
        this.Shader.SetMatrix4Uniform(PROJECTION_MATRIX_UNIFORM, globalUniforms.projectionMatrix);
        this.Shader.SetMatrix3Uniform(NORMAL_MATRIX_UNIFORM, globalUniforms.normalMatrix);

        this.Shader.SetFloat3Uniform(VIEW_POSITION_UNIFORM, globalUniforms.viewPosition);
        this.Shader.SetFloat3Uniform(AMBIENT_LIGHT_UNIFORM, globalUniforms.ambientLight);
        this.Shader.SetFloat4VectorUniform(POINT_LIGHTS_DATA_UNIFORM, globalUniforms.lightsData);

        this.Shader.SetFloat3Uniform("uColor", this.color);
        this.Shader.SetFloat2Uniform("uSpecularPower", this.specularPower);
    }
}

const vsSource: string = `
attribute vec3 ${POSITION_ATTRIBUTE};
attribute vec4 ${COLOR_ATTRIBUTE};
attribute vec3 ${NORMAL_ATTRIBUTE};
attribute vec2 ${UV0_ATTRIBUTE};

uniform mat4 ${MODEL_MATRIX_UNIFORM};
uniform mat4 ${VIEW_MATRIX_UNIFORM};
uniform mat4 ${PROJECTION_MATRIX_UNIFORM};
uniform mat3 ${NORMAL_MATRIX_UNIFORM};

varying vec4 vWorldPosition;
varying vec3 vWorldNormal;
varying vec4 vColor;
varying vec2 vUV0;

void main() {
    vec4 worldPosition = ${MODEL_MATRIX_UNIFORM} * vec4(${POSITION_ATTRIBUTE}, 1);
    gl_Position = ${PROJECTION_MATRIX_UNIFORM} * ${VIEW_MATRIX_UNIFORM} * worldPosition;
    vWorldPosition = worldPosition;
    vWorldNormal = ${NORMAL_MATRIX_UNIFORM} * ${NORMAL_ATTRIBUTE};
    vColor = ${COLOR_ATTRIBUTE};
    vUV0 = ${UV0_ATTRIBUTE};
}`;

const fsSource: string = `
precision mediump float;

varying vec4 vWorldPosition;
varying vec3 vWorldNormal;
varying vec4 vColor;
varying vec2 vUV0;

uniform vec3 uColor;
uniform vec3 uViewPosition;
uniform vec3 uAmbientLight;
uniform vec4 uPointLightsData[${MAX_LIGHTS} * ${LIGHT_DATA_SIZE}];
uniform vec2 uSpecularPower;

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
	vec3 viewDir = normalize(uViewPosition - vWorldPosition.xyz);

	vec3 diffuseColor = (/*texture(mainTexture, texCoord) * */ vColor.rgb * uColor).rgb;
	float specularTex = 1.0; // texture(glossTexture, texCoord).x;
	float specularStrength = uSpecularPower.x; // mix(0.25, uSpecularPower.x, specularTex);
	float specularPower = uSpecularPower.y; // mix(1.0, uSpecularPower.y, specularTex);

	vec3 lights = vec3(0, 0, 0);
	for(int i = 0; i < ${MAX_LIGHTS}; i++)
	{
		vec4 lightPositionIntensity = uPointLightsData[i * ${LIGHT_DATA_SIZE}];
		vec4 lightColor = uPointLightsData[i * ${LIGHT_DATA_SIZE} + 1];
		lights += CalcPointLight(lightPositionIntensity.xyz, lightPositionIntensity.w, lightColor.rgb, diffuseColor, specularStrength, specularPower, normalizedWorldNormal, viewDir);
	}

	gl_FragColor = vec4(lights + uAmbientLight, 1);
}`;